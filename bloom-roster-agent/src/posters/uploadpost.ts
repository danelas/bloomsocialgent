import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const API_BASE = "https://api.upload-post.com/api";

export type Platform = "instagram" | "tiktok" | "youtube" | "facebook";

type PostInput = {
  caption: string;
  title?: string;
  mediaPath: string;
  mediaKind: "image" | "video";
  platforms: Platform[];
  scheduledTime?: Date;
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
  const fileBuf = await readFile(input.mediaPath);
  const fileName = basename(input.mediaPath);
  const blob = new Blob([fileBuf]);

  const form = new FormData();
  form.append("user", userProfile());
  for (const p of input.platforms) form.append("platform[]", p);
  if (input.scheduledTime) {
    form.append("scheduled_time", input.scheduledTime.toISOString());
  }

  let endpoint: string;
  if (input.mediaKind === "video") {
    endpoint = `${API_BASE}/upload`;
    form.append("video", blob, fileName);
    form.append("title", input.title ?? input.caption.slice(0, 90));
    form.append("description", input.caption);
  } else {
    endpoint = `${API_BASE}/upload_photos`;
    form.append("photos[]", blob, fileName);
    form.append("caption", input.caption);
    form.append("title", input.title ?? input.caption.slice(0, 90));
  }

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: authHeader(),
    body: form,
  });

  const bodyText = await resp.text();
  if (!resp.ok) {
    throw new Error(`upload-post ${input.mediaKind} post failed: ${resp.status} ${bodyText}`);
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return bodyText;
  }
}
