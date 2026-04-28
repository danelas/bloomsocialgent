import dotenv from "dotenv";
// .env wins over shell — handles the case where the shell has empty stubs
dotenv.config({ override: true });
import { resolve } from "node:path";
import {
  planPost,
  type PostPlan,
  type PostType,
  type Pillar,
  type Audience,
} from "./planner/index.ts";
import { generateImage } from "./generators/image.ts";
import { renderVideo } from "./generators/video.ts";
import { postToUploadPost, type Platform } from "./posters/uploadpost.ts";
import { makePreviewDir, writeJson, writeText } from "./util/preview.ts";
import { etHourToUtc } from "./util/et.ts";

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_VIDEO = process.argv.includes("--no-video");

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

type Slot = {
  name: "A" | "B" | "C";
  etHour: number;
  postType: PostType;
  /** Platforms that get the static image as their post (IG feed, FB feed) */
  imagePlatforms: Platform[];
  /** Platforms that get the video as their post (TT, IG Reel, YT Shorts, FB) */
  videoPlatforms: Platform[];
  /** Platforms that get a text-first post (X, Reddit). Reddit limited to 1/day. */
  textPlatforms: Platform[];
};

async function buildSlot(
  slot: Slot,
  rootDir: string,
  pillarOverride?: Pillar,
  audienceOverride?: Audience
): Promise<{
  plan: PostPlan;
  feedImagePath: string | null;
  videoPath: string | null;
  dir: string;
}> {
  const dir = resolve(rootDir, `slot-${slot.name}`);
  await makePreviewDir(dir);

  console.log(`[slot ${slot.name}] planning...`);
  const plan = await planPost({
    postType: slot.postType,
    pillar: pillarOverride,
    audience: audienceOverride,
  });
  await writeJson(resolve(dir, "plan.json"), plan);

  // Write each platform's caption to its own file for easy review
  await writeText(resolve(dir, "caption-instagram.txt"), plan.caption.instagram);
  await writeText(resolve(dir, "caption-tiktok.txt"), plan.caption.tiktok);
  await writeText(resolve(dir, "caption-facebook.txt"), plan.caption.facebook);
  await writeText(resolve(dir, "caption-twitter.txt"), plan.caption.twitter);
  await writeText(
    resolve(dir, "youtube.txt"),
    `TITLE: ${plan.caption.youtube.title}\n\nDESCRIPTION:\n${plan.caption.youtube.description}`
  );
  await writeText(
    resolve(dir, "reddit.md"),
    `# r/${plan.caption.reddit.subreddit}\n\n## ${plan.caption.reddit.title}\n\n${plan.caption.reddit.body}\n\n---\n\n_Suggested first comment to drop after the post lands:_\n\n> If anyone wants to dig in further, I write more about this stuff at bloomroster.com — happy to answer questions in the thread.`
  );

  console.log(
    `[slot ${slot.name}] pillar=${plan.pillar} audience=${plan.audience} style=${plan.style} postType=${plan.postType} subreddit=r/${plan.caption.reddit.subreddit}`
  );

  let feedImagePath: string | null = null;
  if (
    slot.imagePlatforms.length > 0 &&
    plan.postType === "ai-image"
  ) {
    feedImagePath = resolve(dir, "image.png");
    await generateImage(plan.imagePrompt, feedImagePath, "1024x1536");
  }

  let videoPath: string | null = null;
  if (!SKIP_VIDEO && slot.videoPlatforms.length > 0) {
    let videoBgPath: string;
    if (feedImagePath) {
      videoBgPath = feedImagePath;
    } else {
      videoBgPath = resolve(dir, "video-bg.png");
      await generateImage(plan.imagePrompt, videoBgPath, "1024x1536");
    }
    try {
      videoPath = resolve(dir, "video.mp4");
      await renderVideo(plan, videoBgPath, videoPath);
    } catch (err) {
      console.warn(
        `[slot ${slot.name}] video render failed: ${(err as Error).message}`
      );
      videoPath = null;
    }
  }

  return { plan, feedImagePath, videoPath, dir };
}

function captionWithHashtags(plan: PostPlan, base: string): string {
  return [base, "", plan.hashtags.map((h) => `#${h}`).join(" ")].join("\n");
}

async function postSlot(
  slot: Slot,
  built: Awaited<ReturnType<typeof buildSlot>>,
  scheduledTime: Date
): Promise<void> {
  const { plan, feedImagePath, videoPath } = built;

  // -------- 1. IMAGE post (IG feed, FB feed) --------
  if (feedImagePath && slot.imagePlatforms.length > 0) {
    const igCaption = captionWithHashtags(plan, plan.caption.instagram);
    const fbCaption = captionWithHashtags(plan, plan.caption.facebook);
    // IG and FB get separate posts so each gets its own caption
    for (const p of slot.imagePlatforms) {
      const caption = p === "facebook" ? fbCaption : igCaption;
      console.log(`[slot ${slot.name}] image → ${p}`);
      const r = await postToUploadPost({
        caption,
        title: `Bloom Roster — ${plan.theme}`,
        mediaPath: feedImagePath,
        mediaKind: "image",
        platforms: [p],
        scheduledTime,
      });
      console.log(`[slot ${slot.name}] ${p} image result:`, r);
    }
  }

  // -------- 2. VIDEO post (TT, IG Reel, YT Shorts, FB Reel) --------
  if (videoPath && slot.videoPlatforms.length > 0) {
    for (const p of slot.videoPlatforms) {
      let caption: string;
      let title: string;
      if (p === "tiktok") {
        caption = captionWithHashtags(plan, plan.caption.tiktok);
        title = plan.caption.tiktok.slice(0, 90);
      } else if (p === "instagram") {
        caption = captionWithHashtags(plan, plan.caption.instagram);
        title = `Bloom Roster — ${plan.theme}`;
      } else if (p === "facebook") {
        caption = captionWithHashtags(plan, plan.caption.facebook);
        title = `Bloom Roster — ${plan.theme}`;
      } else if (p === "youtube") {
        caption = plan.caption.youtube.description;
        title = plan.caption.youtube.title;
      } else {
        caption = plan.caption.tiktok;
        title = `Bloom Roster — ${plan.theme}`;
      }
      console.log(`[slot ${slot.name}] video → ${p}`);
      const r = await postToUploadPost({
        caption,
        title,
        mediaPath: videoPath,
        mediaKind: "video",
        platforms: [p],
        scheduledTime,
      });
      console.log(`[slot ${slot.name}] ${p} video result:`, r);
    }
  }

  // -------- 3. TEXT-FIRST posts (X, Reddit) --------
  for (const p of slot.textPlatforms) {
    if (p === "x" || p === "twitter") {
      // X posts the video if we have one, otherwise text-only with the image
      const text = plan.caption.twitter;
      console.log(`[slot ${slot.name}] text → x`);
      try {
        if (videoPath) {
          const r = await postToUploadPost({
            caption: text,
            mediaPath: videoPath,
            mediaKind: "video",
            platforms: [p],
            scheduledTime,
          });
          console.log(`[slot ${slot.name}] x result:`, r);
        } else if (feedImagePath) {
          const r = await postToUploadPost({
            caption: text,
            mediaPath: feedImagePath,
            mediaKind: "image",
            platforms: [p],
            scheduledTime,
          });
          console.log(`[slot ${slot.name}] x result:`, r);
        }
      } catch (err) {
        console.warn(
          `[slot ${slot.name}] x post failed (Upload-Post may not support media-less x): ${(err as Error).message}`
        );
      }
    }

    if (p === "reddit") {
      console.log(
        `[slot ${slot.name}] text → reddit r/${plan.caption.reddit.subreddit}`
      );
      const r = await postToUploadPost({
        caption: plan.caption.reddit.body,
        title: plan.caption.reddit.title,
        platforms: [p],
        subreddit: plan.caption.reddit.subreddit,
        scheduledTime,
      });
      console.log(`[slot ${slot.name}] reddit result:`, r);
    }
  }
}

async function main() {
  console.log(`[bloom-agent] dry-run=${DRY_RUN} skip-video=${SKIP_VIDEO}`);

  const rootDir = await makePreviewDir();
  console.log(`[bloom-agent] preview root: ${rootDir}`);

  const slots: Slot[] = [
    // Morning — punchy short video for TikTok + X. Reddit goes here (1/day max).
    {
      name: "A",
      etHour: 9,
      postType: "video-only",
      imagePlatforms: [],
      videoPlatforms: ["tiktok"],
      textPlatforms: ["x", "reddit"],
    },
    // Midday — IG/FB feed image + TT/YT video + X. Image-led slot.
    {
      name: "B",
      etHour: 12,
      postType: "ai-image",
      imagePlatforms: ["instagram", "facebook"],
      videoPlatforms: ["tiktok", "youtube"],
      textPlatforms: ["x"],
    },
    // Evening — peak engagement, blast video to all video platforms + X.
    {
      name: "C",
      etHour: 20,
      postType: "video-only",
      imagePlatforms: [],
      videoPlatforms: ["tiktok", "instagram", "youtube", "facebook"],
      textPlatforms: ["x"],
    },
  ];

  const only = argValue("slot");
  const active = only
    ? slots.filter((s) => s.name === only.toUpperCase())
    : slots;

  const forcePillar = argValue("pillar") as Pillar | undefined;
  const forceAudience = argValue("audience") as Audience | undefined;

  const now = new Date();
  for (const slot of active) {
    const scheduledTime = etHourToUtc(slot.etHour, 0, now);
    console.log(
      `[slot ${slot.name}] scheduled for ${slot.etHour}:00 ET → ${scheduledTime.toISOString()} UTC`
    );

    const built = await buildSlot(slot, rootDir, forcePillar, forceAudience);

    if (DRY_RUN) {
      console.log(`[slot ${slot.name}] dry-run — skipping uploads`);
      continue;
    }

    await postSlot(slot, built, scheduledTime);
  }
}

main().catch((err) => {
  console.error("[bloom-agent] failed:", err);
  process.exit(1);
});
