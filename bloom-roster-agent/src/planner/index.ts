import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  PILLARS,
  PILLAR_BRIEFS,
  PILLAR_HASHTAGS,
  type Pillar,
} from "../data/pillars.ts";

export { PILLARS, type Pillar };

export const AUDIENCES = ["creator", "brand"] as const;
export type Audience = (typeof AUDIENCES)[number];

export const POST_STYLES = ["trigger", "direct"] as const;
export type PostStyle = (typeof POST_STYLES)[number];

export const POST_TYPES = ["ai-image", "video-only"] as const;
export type PostType = (typeof POST_TYPES)[number];

export const SUBREDDIT_BY_PILLAR: Record<Pillar, string[]> = {
  "money-truth": ["CreatorEconomy", "InfluencerMarketing", "Entrepreneur"],
  "industry-expose": ["CreatorEconomy", "InfluencerMarketing", "Marketing"],
  "bloom-bts": ["startups", "Entrepreneur", "SideProject", "buildinpublic"],
  "creator-coaching": ["CreatorEconomy", "InfluencerMarketing", "smallbusiness"],
  "aesthetic-mood": ["startups", "Entrepreneur"],
};

// FLAT schema — each platform is a top-level field. Previous nested
// "caption" object kept getting collapsed into a single string by the model.
export const PostPlanSchema = z.object({
  pillar: z.enum(PILLARS),
  audience: z.enum(AUDIENCES),
  style: z.enum(POST_STYLES),
  postType: z.enum(POST_TYPES),
  commentKeyword: z.string().nullable(),
  theme: z.string(),

  instagramCaption: z.string(),
  tiktokCaption: z.string(),
  facebookCaption: z.string(),
  twitterCaption: z.string(),
  youtubeTitle: z.string(),
  youtubeDescription: z.string(),
  redditSubreddit: z.string(),
  redditTitle: z.string(),
  redditBody: z.string(),

  hashtags: z.array(z.string()),
  imagePrompt: z.string(),
  videoHook: z.string(),
  videoBody: z.string(),
  videoCta: z.string(),
  onScreenText: z.array(
    z.object({
      text: z.string(),
      startSeconds: z.number(),
      durationSeconds: z.number(),
    })
  ),
});

export type PostPlan = z.infer<typeof PostPlanSchema>;

const POST_PLAN_TOOL = {
  name: "submit_post_plan",
  description:
    "Submit the planned post for today. Each platform field is a SEPARATE string with native, distinct content — never combined.",
  input_schema: {
    type: "object" as const,
    properties: {
      pillar: { type: "string", enum: [...PILLARS] },
      audience: { type: "string", enum: [...AUDIENCES] },
      style: { type: "string", enum: [...POST_STYLES] },
      postType: { type: "string", enum: [...POST_TYPES] },
      commentKeyword: { type: ["string", "null"] },
      theme: { type: "string", description: "2-4 word internal label" },

      instagramCaption: {
        type: "string",
        description: "100-180 words MAX. Tight founder voice. 3-4 short paragraphs. Hook line first, then the case in 2-3 lines, then the CTA. Cut every adjective that doesn't earn its place.",
      },
      tiktokCaption: {
        type: "string",
        description: "Under 150 chars, punchy, no inline hashtags",
      },
      facebookCaption: {
        type: "string",
        description: "Around 150 words, no emoji",
      },
      twitterCaption: {
        type: "string",
        description:
          "Under 240 chars, NO hashtags, single bold claim, ends with → bloomroster.com",
      },
      youtubeTitle: {
        type: "string",
        description: "60-80 chars, SEO-loaded with creator-economy keywords",
      },
      youtubeDescription: {
        type: "string",
        description: "2-3 sentences, ends with → bloomroster.com",
      },
      redditSubreddit: {
        type: "string",
        description: "subreddit name without leading r/",
      },
      redditTitle: {
        type: "string",
        description:
          "Reddit-native — observation/question/data finding. Never starts with emoji or 'Just launched'",
      },
      redditBody: {
        type: "string",
        description:
          "200-600 words, first-person, value-first, ZERO direct CTA, NO bloomroster.com URL anywhere in body",
      },

      hashtags: {
        type: "array",
        items: { type: "string" },
        description: "8-12 hashtags WITHOUT # symbol",
      },
      imagePrompt: {
        type: "string",
        description: "Prompt for gpt-image-1 1024x1536, editorial flat-lay only",
      },
      videoHook: { type: "string" },
      videoBody: { type: "string" },
      videoCta: { type: "string" },
      onScreenText: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string" },
            startSeconds: { type: "number" },
            durationSeconds: { type: "number" },
          },
          required: ["text", "startSeconds", "durationSeconds"],
        },
      },
    },
    required: [
      "pillar",
      "audience",
      "style",
      "postType",
      "commentKeyword",
      "theme",
      "instagramCaption",
      "tiktokCaption",
      "facebookCaption",
      "twitterCaption",
      "youtubeTitle",
      "youtubeDescription",
      "redditSubreddit",
      "redditTitle",
      "redditBody",
      "hashtags",
      "imagePrompt",
      "videoHook",
      "videoBody",
      "videoCta",
      "onScreenText",
    ],
  },
};

const SYSTEM = `You plan daily social content for Bloom Roster (bloomroster.com), the first marketplace built for adult-friendly brand sponsorships and the creators who actually move premium audiences.

Bloom Roster connects creators (whose audiences include adult-friendly demographics — fitness, lifestyle, swimwear, alt, cosplay, beauty, lingerie, OF-adjacent) with brands in categories that mainstream influencer platforms ban: spirits, swimwear, lingerie, nightlife, supplements, cannabis, vape, hookah, hospitality, jewelry.

Brand voice: Premium · Insider · Smart · Confident.

CRITICAL SFW + PLATFORM-SAFETY GUARDRAILS:
1. Never mention "OnlyFans," "porn," "explicit," "NSFW," "sex worker." Use coded language.
2. Never name competitor platforms. Use "the big platforms," "the legacy marketplaces."
3. Image prompt must NEVER produce thirst content. Pure editorial only.
4. No vulgarity. No cheap slang.

PER-PLATFORM CULTURE — generate native, DISTINCT content per platform:

INSTAGRAM CAPTION: 100-180 words MAX. Tight founder voice. Hook line first. 2-3 short paragraphs. CTA at the end. Cut every word that doesn't earn its place. Emoji sparingly.

TIKTOK CAPTION: Punchy. <150 chars. No inline hashtags. Hook-first. Casual.

FACEBOOK CAPTION: Older skewing. ~80 words, no emoji.

TWITTER CAPTION: Text-FIRST. <240 chars. NO hashtags (kill reach on X). Single bold claim/stat. Adult-friendly platform so language can be more direct. Ends with → bloomroster.com.

YOUTUBE TITLE: SEO-loaded with creator-economy keywords. 60-80 chars.
YOUTUBE DESCRIPTION: 2-3 sentences with URL.

REDDIT (CRITICAL — DIFFERENT RULES):
- Reddit nukes promo accounts. The post must read as GENUINE first-person value, not advertising.
- redditBody NEVER includes "bloomroster.com" or any URL. Body has zero CTA.
- redditTitle sounds native: a curious observation, a question, a data finding. Never starts with "🔥" or "Just launched" or "Check out".
- redditBody is 200-600 words, first-person, value-first, with specific numbers/frameworks. Mention "I run a marketplace called Bloom Roster" ONCE in passing if at all.
- Pick ONE subreddit per post that fits the pillar.

Always call submit_post_plan with the complete plan and ALL fields populated.`;

function dayIndex(): number {
  const start = new Date(Date.UTC(2026, 0, 1));
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function pickPillar(d: number = dayIndex()): Pillar {
  return PILLARS[((d % PILLARS.length) + PILLARS.length) % PILLARS.length];
}
export function pickStyle(d: number = dayIndex()): PostStyle {
  return d % 4 < 3 ? "trigger" : "direct";
}
export function pickAudience(d: number = dayIndex()): Audience {
  return d % 5 === 0 ? "brand" : "creator";
}
export function pickPostType(d: number = dayIndex()): PostType {
  return d % 3 === 0 ? "ai-image" : "video-only";
}
export function keywordFor(audience: Audience): string {
  return audience === "creator" ? "ROSTER" : "BRAND";
}

export type PlanOverrides = {
  pillar?: Pillar;
  style?: PostStyle;
  audience?: Audience;
  postType?: PostType;
};

export async function planPost(overrides: PlanOverrides = {}): Promise<PostPlan> {
  const anthropic = new Anthropic();
  const today = new Date().toISOString().slice(0, 10);
  const d = dayIndex();
  const pillar = overrides.pillar ?? pickPillar(d);
  const style = overrides.style ?? pickStyle(d);
  const audience = overrides.audience ?? pickAudience(d);
  const postType = overrides.postType ?? pickPostType(d);
  const keyword = style === "trigger" ? keywordFor(audience) : null;

  const audienceDirective =
    audience === "creator"
      ? `TARGET AUDIENCE: CREATORS. Women creators on TikTok/IG/X with audiences in adult-friendly demographics (fitness, swimwear, lifestyle, beauty, alt, cosplay). Speak to her pain: bad brand DMs, banned from mainstream marketplaces, underpaid, exposure-deal nonsense.`
      : `TARGET AUDIENCE: BRAND MARKETERS at spirits/swimwear/lingerie/nightlife/supplement companies. Speak to their pain: can't legally use the big platforms to reach this audience, manually DMing creators, contracts a mess.`;

  const ctaDirective =
    style === "trigger"
      ? `CTA STYLE (IG/TT/FB only — Reddit gets NO CTA): Captions end with "💬 Comment ${keyword} below and I'll DM you the link (or visit bloomroster.com)". Final video on-screen-text must be EXACTLY "Comment ${keyword} ↓".`
      : `CTA STYLE (IG/TT/FB only — Reddit gets NO CTA): Captions end with "→ bloomroster.com". Final video on-screen-text is EXACTLY "bloomroster.com".`;

  const pillarBrief = PILLAR_BRIEFS[pillar];
  const baseHashtags = PILLAR_HASHTAGS[pillar];
  const subredditOptions = SUBREDDIT_BY_PILLAR[pillar];

  const userPrompt = `Plan today's post (${today}).

PILLAR: ${pillar}
PILLAR BRIEF: ${pillarBrief}

${audienceDirective}
${ctaDirective}

POST TYPE: ${postType}
SET pillar="${pillar}", audience="${audience}", style="${style}", postType="${postType}", commentKeyword=${keyword ? `"${keyword}"` : "null"}.

REDDIT SUBREDDIT options (set redditSubreddit to ONE of these): ${subredditOptions.map((s) => `"${s}"`).join(", ")}

HASHTAGS: include these base tags plus 3-5 niche-specific: ${baseHashtags.join(", ")}

VIDEO: 4-6 onScreenText beats, total under 18 seconds, each text under 60 chars. The FINAL beat's "text" must be EXACTLY "${style === "trigger" ? `Comment ${keyword} ↓` : "bloomroster.com"}".

Hook rules:
- money-truth pillar: videoHook starts with a specific number
- industry-expose pillar: videoHook starts with "Why" or "Here's why"
- never start with "Hey guys" or "POV"

IMAGE PROMPT: editorial 1024x1536 portrait. Warm cream (#FAF7F2) + deep emerald (#1F4D3F) + gold (#C9A961). Editorial magazine quality, golden hour, premium materials, Miami/South Beach lifestyle. Subjects: flat-lay still life, architectural interior, abstract gold/palm shadow, hands holding phone with dashboard mockup, overhead workspace. NO PEOPLE in revealing clothing. NO body close-ups. End with: "No text, no lettering, no watermarks, no signage, no captions, no logos."

Now call submit_post_plan with EVERY field populated. Each caption field is its own separate string — instagramCaption, tiktokCaption, facebookCaption, twitterCaption, youtubeTitle, youtubeDescription, redditSubreddit, redditTitle, redditBody. Do NOT merge them.`;

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userPrompt },
  ];

  const MAX_ATTEMPTS = 3;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const resp = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      system: SYSTEM,
      tools: [POST_PLAN_TOOL],
      tool_choice: { type: "tool", name: "submit_post_plan" },
      messages,
    });

    const toolUse = resp.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    if (!toolUse) {
      throw new Error(
        "planner: no tool_use in response. Stop reason: " + resp.stop_reason
      );
    }

    const result = PostPlanSchema.safeParse(toolUse.input);
    if (result.success) {
      if (attempt > 1) console.log(`[planner] succeeded on attempt ${attempt}`);
      return result.data;
    }

    lastError = result.error;
    console.warn(
      `[planner] attempt ${attempt}/${MAX_ATTEMPTS} failed schema validation:`,
      result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")
    );

    if (attempt === MAX_ATTEMPTS) break;

    const issuesSummary = result.error.issues
      .map(
        (i) =>
          `- Field "${i.path.join(".") || "(root)"}": ${i.message}`
      )
      .join("\n");

    messages.push(
      { role: "assistant", content: [toolUse] },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `Validation failed:\n\n${issuesSummary}\n\nResubmit submit_post_plan with EVERY field as a separate top-level string. The fields are flat — no nesting except onScreenText (array of objects).`,
            is_error: true,
          },
        ],
      }
    );
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("planner: exhausted retries without valid output");
}
