import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const API_BASE = "https://api.upload-post.com/api";

export type Platform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "x"
  | "twitter"
  | "reddit";

type PostInput = {
  caption: string;
  title?: string;
  mediaPath?: string;
  mediaKind?: "image" | "video";
  platforms: Platform[];
  scheduledTime?: Date;
  /** Reddit only — target subreddit name (no leading r/) */
  subreddit?: string;
};

function authHeader(): Record<string, string> {
  const key = process.env.UPLOAD_POST_API_KEY;
  if (!key) throw new Error("UPLOAD_POST_API_KEY not set");
  return { Authorization: `Apikey ${key}` };
}

function userProfile(): string {
  const user = process.env.UPLOAD_POST_USER;
  if (!user)
    throw new Error(
      "UPLOAD_POST_USER not set (the profile name in your Upload-Post dashboard with IG + TikTok connected for Bloom Roster)"
    );
  return user;
}

export async function postToUploadPost(input: PostInput): Promise<unknown> {
  const form = new FormData();
  form.append("user", userProfile());
  for (const p of input.platforms) form.append("platform[]", p);
  if (input.scheduledTime) {
    form.append("scheduled_time", input.scheduledTime.toISOString());
  }
  if (input.subreddit) {
    // Upload-Post field for the destination subreddit (no leading r/)
    form.append("subreddit", input.subreddit);
  }

  let endpoint: string;

  // Reddit text-only posts go through the text endpoint
  if (input.platforms.includes("reddit") && !input.mediaPath) {
    endpoint = `${API_BASE}/upload_text`;
    form.append("title", input.title ?? input.caption.slice(0, 280));
    form.append("text", input.caption);
  } else if (input.mediaKind === "video" && input.mediaPath) {
    endpoint = `${API_BASE}/upload`;
    const fileBuf = await readFile(input.mediaPath);
    const fileName = basename(input.mediaPath);
    form.append("video", new Blob([fileBuf]), fileName);
    form.append("title", input.title ?? input.caption.slice(0, 90));
    form.append("description", input.caption);
  } else if (input.mediaKind === "image" && input.mediaPath) {
    endpoint = `${API_BASE}/upload_photos`;
    const fileBuf = await readFile(input.mediaPath);
    const fileName = basename(input.mediaPath);
    form.append("photos[]", new Blob([fileBuf]), fileName);
    form.append("caption", input.caption);
    form.append("title", input.title ?? input.caption.slice(0, 90));
  } else {
    throw new Error(
      "postToUploadPost: must provide either (mediaPath + mediaKind) or platforms=[reddit] for text-only"
    );
  }

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: authHeader(),
    body: form,
  });

  const bodyText = await resp.text();
  if (!resp.ok) {
    throw new Error(
      `upload-post failed (${input.platforms.join(",")}): ${resp.status} ${bodyText}`
    );
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return bodyText;
  }
}
