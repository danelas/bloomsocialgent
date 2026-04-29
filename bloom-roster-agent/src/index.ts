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
  await writeText(resolve(dir, "caption-instagram.txt"), plan.instagramCaption);
  await writeText(resolve(dir, "caption-tiktok.txt"), plan.tiktokCaption);
  await writeText(resolve(dir, "caption-facebook.txt"), plan.facebookCaption);
  await writeText(resolve(dir, "caption-twitter.txt"), plan.twitterCaption);
  await writeText(
    resolve(dir, "youtube.txt"),
    `TITLE: ${plan.youtubeTitle}\n\nDESCRIPTION:\n${plan.youtubeDescription}`
  );
  await writeText(
    resolve(dir, "reddit.md"),
    `# r/${plan.redditSubreddit}\n\n## ${plan.redditTitle}\n\n${plan.redditBody}\n\n---\n\n_Suggested first comment to drop after the post lands:_\n\n> If anyone wants to dig in further, I write more about this stuff at bloomroster.com — happy to answer questions in the thread.`
  );

  console.log(
    `[slot ${slot.name}] pillar=${plan.pillar} audience=${plan.audience} style=${plan.style} postType=${plan.postType} subreddit=r/${plan.redditSubreddit}`
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

type PostOutcome = { platform: string; ok: boolean; error?: string };

async function safePost(
  label: string,
  fn: () => Promise<unknown>
): Promise<PostOutcome> {
  try {
    const r = await fn();
    console.log(`[${label}] ok:`, r);
    return { platform: label, ok: true };
  } catch (err) {
    const msg = (err as Error).message ?? String(err);
    console.warn(`[${label}] FAILED — continuing. Error: ${msg}`);
    return { platform: label, ok: false, error: msg };
  }
}

async function postSlot(
  slot: Slot,
  built: Awaited<ReturnType<typeof buildSlot>>,
  scheduledTime: Date
): Promise<PostOutcome[]> {
  const { plan, feedImagePath, videoPath } = built;
  const outcomes: PostOutcome[] = [];

  // -------- 1. IMAGE post (IG feed, FB feed) --------
  if (feedImagePath && slot.imagePlatforms.length > 0) {
    const igCaption = captionWithHashtags(plan, plan.instagramCaption);
    const fbCaption = captionWithHashtags(plan, plan.facebookCaption);
    for (const p of slot.imagePlatforms) {
      const caption = p === "facebook" ? fbCaption : igCaption;
      console.log(`[slot ${slot.name}] image → ${p}`);
      outcomes.push(
        await safePost(`slot ${slot.name} ${p} image`, () =>
          postToUploadPost({
            caption,
            title: `Bloom Roster — ${plan.theme}`,
            mediaPath: feedImagePath,
            mediaKind: "image",
            platforms: [p],
            scheduledTime,
          })
        )
      );
    }
  }

  // -------- 2. VIDEO post (TT, IG Reel, YT Shorts, FB Reel) --------
  if (videoPath && slot.videoPlatforms.length > 0) {
    for (const p of slot.videoPlatforms) {
      let caption: string;
      let title: string;
      if (p === "tiktok") {
        caption = captionWithHashtags(plan, plan.tiktokCaption);
        title = plan.tiktokCaption.slice(0, 90);
      } else if (p === "instagram") {
        caption = captionWithHashtags(plan, plan.instagramCaption);
        title = `Bloom Roster — ${plan.theme}`;
      } else if (p === "facebook") {
        caption = captionWithHashtags(plan, plan.facebookCaption);
        title = `Bloom Roster — ${plan.theme}`;
      } else if (p === "youtube") {
        caption = plan.youtubeDescription;
        title = plan.youtubeTitle;
      } else {
        caption = plan.tiktokCaption;
        title = `Bloom Roster — ${plan.theme}`;
      }
      console.log(`[slot ${slot.name}] video → ${p}`);
      outcomes.push(
        await safePost(`slot ${slot.name} ${p} video`, () =>
          postToUploadPost({
            caption,
            title,
            mediaPath: videoPath,
            mediaKind: "video",
            platforms: [p],
            scheduledTime,
          })
        )
      );
    }
  }

  // -------- 3. TEXT-FIRST posts (X, Reddit) --------
  for (const p of slot.textPlatforms) {
    if (p === "x" || p === "twitter") {
      const text = plan.twitterCaption;
      console.log(`[slot ${slot.name}] text → x`);
      if (videoPath) {
        outcomes.push(
          await safePost(`slot ${slot.name} x video`, () =>
            postToUploadPost({
              caption: text,
              mediaPath: videoPath,
              mediaKind: "video",
              platforms: [p],
              scheduledTime,
            })
          )
        );
      } else if (feedImagePath) {
        outcomes.push(
          await safePost(`slot ${slot.name} x image`, () =>
            postToUploadPost({
              caption: text,
              mediaPath: feedImagePath,
              mediaKind: "image",
              platforms: [p],
              scheduledTime,
            })
          )
        );
      }
    }

    if (p === "reddit") {
      console.log(
        `[slot ${slot.name}] text → reddit r/${plan.redditSubreddit}`
      );
      outcomes.push(
        await safePost(`slot ${slot.name} reddit`, () =>
          postToUploadPost({
            caption: plan.redditBody,
            title: plan.redditTitle,
            platforms: [p],
            subreddit: plan.redditSubreddit,
            scheduledTime,
          })
        )
      );
    }
  }

  return outcomes;
}

async function main() {
  console.log(`[bloom-agent] dry-run=${DRY_RUN} skip-video=${SKIP_VIDEO}`);

  const rootDir = await makePreviewDir();
  console.log(`[bloom-agent] preview root: ${rootDir}`);

  const slots: Slot[] = [
    // Morning — short video for TikTok + X.
    // Reddit is generated as markdown (reddit.md) for manual posting from your
    // personal account. Auto-posting from a new agent account gets filter-nuked.
    {
      name: "A",
      etHour: 9,
      postType: "video-only",
      imagePlatforms: [],
      videoPlatforms: ["tiktok"],
      textPlatforms: ["x"],
    },
    // Midday — full video blast across video-native platforms + X.
    // (Removed image-only IG/FB posts — the AI background image alone has no
    // message; Reels with text overlays outperform static feed posts anyway.)
    {
      name: "B",
      etHour: 12,
      postType: "video-only",
      imagePlatforms: [],
      videoPlatforms: ["tiktok", "instagram", "youtube", "facebook"],
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
  const allOutcomes: PostOutcome[] = [];

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

    const slotOutcomes = await postSlot(slot, built, scheduledTime);
    allOutcomes.push(...slotOutcomes);
  }

  // Summary
  if (allOutcomes.length > 0) {
    const ok = allOutcomes.filter((o) => o.ok);
    const failed = allOutcomes.filter((o) => !o.ok);
    console.log(
      `\n[bloom-agent] Summary: ${ok.length} succeeded, ${failed.length} failed (of ${allOutcomes.length} total)`
    );
    if (ok.length > 0) {
      console.log("  ✓ Succeeded: " + ok.map((o) => o.platform).join(", "));
    }
    if (failed.length > 0) {
      console.log("  ✗ Failed:");
      for (const f of failed) {
        console.log(`    - ${f.platform}: ${f.error}`);
      }
      // Only exit non-zero if EVERYTHING failed (real broken state).
      // If some platforms worked, the run is a success — failed ones just need
      // their accounts connected in Upload-Post.
      if (ok.length === 0) {
        process.exit(1);
      }
    }
  }
}

main().catch((err) => {
  console.error("[bloom-agent] failed:", err);
  process.exit(1);
});
