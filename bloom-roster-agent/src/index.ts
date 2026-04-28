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
  imagePlatforms: Platform[];
  videoPlatforms: Platform[];
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
  await writeText(resolve(dir, "caption-instagram.txt"), plan.caption.instagram);
  await writeText(resolve(dir, "caption-tiktok.txt"), plan.caption.tiktok);
  console.log(
    `[slot ${slot.name}] pillar=${plan.pillar} audience=${plan.audience} style=${plan.style} postType=${plan.postType}`
  );

  let feedImagePath: string | null = null;
  if (slot.imagePlatforms.length > 0 && plan.postType === "ai-image") {
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

function captionsFor(plan: PostPlan) {
  const ig = [
    plan.caption.instagram,
    "",
    plan.hashtags.map((h) => `#${h}`).join(" "),
  ].join("\n");
  const tt = [
    plan.caption.tiktok,
    plan.hashtags.slice(0, 5).map((h) => `#${h}`).join(" "),
  ].join(" ");
  return { ig, tt };
}

async function main() {
  console.log(`[bloom-agent] dry-run=${DRY_RUN} skip-video=${SKIP_VIDEO}`);

  const rootDir = await makePreviewDir();
  console.log(`[bloom-agent] preview root: ${rootDir}`);

  const slots: Slot[] = [
    // Morning: short punchy video, TikTok only — feeds the algorithm early
    {
      name: "A",
      etHour: 9,
      postType: "video-only",
      imagePlatforms: [],
      videoPlatforms: ["tiktok"],
    },
    // Midday: AI image + everywhere — IG/FB anchor + TT/YT for video
    {
      name: "B",
      etHour: 12,
      postType: "ai-image",
      imagePlatforms: ["instagram", "facebook"],
      videoPlatforms: ["tiktok", "youtube"],
    },
    // Evening: video everywhere — peak engagement window
    {
      name: "C",
      etHour: 20,
      postType: "video-only",
      imagePlatforms: [],
      videoPlatforms: ["tiktok", "instagram", "youtube", "facebook"],
    },
  ];

  const only = argValue("slot");
  const active = only ? slots.filter((s) => s.name === only.toUpperCase()) : slots;

  const forcePillar = argValue("pillar") as Pillar | undefined;
  const forceAudience = argValue("audience") as Audience | undefined;

  const now = new Date();
  for (const slot of active) {
    const scheduledTime = etHourToUtc(slot.etHour, 0, now);
    console.log(
      `[slot ${slot.name}] scheduled for ${slot.etHour}:00 ET → ${scheduledTime.toISOString()} UTC`
    );

    const built = await buildSlot(slot, rootDir, forcePillar, forceAudience);
    const { plan, feedImagePath, videoPath } = built;
    const { ig, tt } = captionsFor(plan);

    if (DRY_RUN) {
      console.log(`[slot ${slot.name}] dry-run — skipping upload`);
      continue;
    }

    if (feedImagePath && slot.imagePlatforms.length > 0) {
      console.log(
        `[slot ${slot.name}] scheduling image → ${slot.imagePlatforms.join("+")}`
      );
      const r = await postToUploadPost({
        caption: ig,
        title: `Bloom Roster — ${plan.theme}`,
        mediaPath: feedImagePath,
        mediaKind: "image",
        platforms: slot.imagePlatforms,
        scheduledTime,
      });
      console.log(`[slot ${slot.name}] image result:`, r);
    }

    if (videoPath && slot.videoPlatforms.length > 0) {
      console.log(
        `[slot ${slot.name}] scheduling video → ${slot.videoPlatforms.join("+")}`
      );
      const r = await postToUploadPost({
        caption: tt,
        title: `Bloom Roster — ${plan.theme}`,
        mediaPath: videoPath,
        mediaKind: "video",
        platforms: slot.videoPlatforms,
        scheduledTime,
      });
      console.log(`[slot ${slot.name}] video result:`, r);
    }
  }
}

main().catch((err) => {
  console.error("[bloom-agent] failed:", err);
  process.exit(1);
});
