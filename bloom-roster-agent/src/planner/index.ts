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

// Best-fit subreddits per pillar.
export const SUBREDDIT_BY_PILLAR: Record<Pillar, string[]> = {
  "money-truth": ["CreatorEconomy", "InfluencerMarketing", "Entrepreneur"],
  "industry-expose": ["CreatorEconomy", "InfluencerMarketing", "Marketing"],
  "bloom-bts": ["startups", "Entrepreneur", "SideProject", "buildinpublic"],
  "creator-coaching": ["CreatorEconomy", "InfluencerMarketing", "smallbusiness"],
  "aesthetic-mood": ["startups", "Entrepreneur"],
};

export const PostPlanSchema = z.object({
  pillar: z.enum(PILLARS),
  audience: z.enum(AUDIENCES),
  style: z.enum(POST_STYLES),
  postType: z.enum(POST_TYPES),
  commentKeyword: z.string().nullable(),
  theme: z.string(),
  caption: z.object({
    instagram: z.string(),
    tiktok: z.string(),
    facebook: z.string(),
    twitter: z.string(),
    youtube: z.object({
      title: z.string(),
      description: z.string(),
    }),
    reddit: z.object({
      subreddit: z.string(),
      title: z.string(),
      body: z.string(),
    }),
  }),
  hashtags: z.array(z.string()),
  imagePrompt: z.string(),
  videoScript: z.object({
    hook: z.string(),
    body: z.string(),
    cta: z.string(),
    onScreenText: z.array(
      z.object({
        text: z.string(),
        startSeconds: z.number(),
        durationSeconds: z.number(),
      })
    ),
  }),
});

export type PostPlan = z.infer<typeof PostPlanSchema>;

// JSON Schema for Claude tool_use. Mirrors the Zod schema above.
// Using tool_use guarantees the SDK returns a valid object — no fragile
// JSON.parse against free-form text output.
const POST_PLAN_TOOL = {
  name: "submit_post_plan",
  description:
    "Submit the planned post for today. ALL fields required. Each platform variant must be culturally native (TikTok ≠ Reddit ≠ X).",
  input_schema: {
    type: "object" as const,
    properties: {
      pillar: { type: "string", enum: [...PILLARS] },
      audience: { type: "string", enum: [...AUDIENCES] },
      style: { type: "string", enum: [...POST_STYLES] },
      postType: { type: "string", enum: [...POST_TYPES] },
      commentKeyword: { type: ["string", "null"] },
      theme: { type: "string", description: "2-4 word internal label" },
      caption: {
        type: "object",
        properties: {
          instagram: {
            type: "string",
            description:
              "200-500 word founder-voice caption with the trigger CTA",
          },
          tiktok: {
            type: "string",
            description: "<150 char punchy caption, no inline hashtags",
          },
          facebook: {
            type: "string",
            description: "~150 word trimmed version, no emoji",
          },
          twitter: {
            type: "string",
            description:
              "<240 char text-first single bold claim, no hashtags, ends with → bloomroster.com",
          },
          youtube: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
            },
            required: ["title", "description"],
          },
          reddit: {
            type: "object",
            properties: {
              subreddit: { type: "string" },
              title: { type: "string" },
              body: {
                type: "string",
                description:
                  "200-600 word value-first post, ZERO direct CTA, NO bloomroster.com URL in body",
              },
            },
            required: ["subreddit", "title", "body"],
          },
        },
        required: [
          "instagram",
          "tiktok",
          "facebook",
          "twitter",
          "youtube",
          "reddit",
        ],
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
      videoScript: {
        type: "object",
        properties: {
          hook: { type: "string" },
          body: { type: "string" },
          cta: { type: "string" },
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
        required: ["hook", "body", "cta", "onScreenText"],
      },
    },
    required: [
      "pillar",
      "audience",
      "style",
      "postType",
      "commentKeyword",
      "theme",
      "caption",
      "hashtags",
      "imagePrompt",
      "videoScript",
    ],
  },
};

const SYSTEM = `You plan daily social content for Bloom Roster (bloomroster.com), the first marketplace built for adult-friendly brand sponsorships and the creators who actually move premium audiences.

Bloom Roster connects creators (whose audiences include adult-friendly demographics — fitness, lifestyle, swimwear, alt, cosplay, beauty, lingerie, OF-adjacent) with brands in categories that mainstream influencer platforms ban: spirits, swimwear, lingerie, nightlife, supplements, cannabis, vape, hookah, hospitality, jewelry.

Brand voice: Premium · Insider · Smart · Confident. Think Modern Retail meets a finance Tok account meets a creator coach.

CRITICAL SFW + PLATFORM-SAFETY GUARDRAILS:
1. Never mention "OnlyFans," "porn," "explicit," "NSFW," "sex worker," or "adult content" by name. Use coded language: "the platforms we serve," "subscription creators," "premium audiences," "adult-friendly creators," "the categories mainstream platforms ban."
2. Never name competitor platforms (Aspire, GRIN, Collabstr, #paid). Use "the big platforms," "the legacy marketplaces."
3. Image prompt must NEVER produce thirst content, bikini shots, suggestive poses, body close-ups. Pure editorial only.
4. No vulgarity. No slang that reads cheap.

PER-PLATFORM CULTURE (do NOT just copy-paste — generate native content per platform):

INSTAGRAM (Reels + feed): Aspirational founder voice. 200-500 words OK. Hook line first, then build the case in 3-5 short paragraphs, then CTA. Emoji sparingly.

TIKTOK: Punchy. <150 chars. No inline hashtags. Hook-first. Casual, conspiratorial.

FACEBOOK: Slightly older skewing. Trimmed IG version, ~150 words, no emoji.

TWITTER / X: Text-FIRST. <240 chars. NO hashtags (kill reach on X). Single bold claim/stat that someone wants to share. Adult-friendly so language can be more direct.

YOUTUBE SHORTS: SEO-loaded title with creator-economy keywords. Description: 2-3 sentences with URL.

REDDIT (CRITICAL — DIFFERENT RULES):
- Reddit nukes promo accounts. Post must read as GENUINE first-person value, not advertising.
- NEVER include "bloomroster.com" or any direct URL in the body. Body has zero CTA.
- Title sounds native: a curious observation, a question, a data finding. Never starts with "🔥" or "Just launched" or "Check out".
- Body 200-600 words, first-person, value-first, with specific numbers/frameworks. Mention "I run a marketplace called Bloom Roster" ONCE in passing if at all.
- Subreddit choice matters — pick ONE that fits the pillar.

Always call submit_post_plan with the complete plan.`;

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
      ? `TARGET AUDIENCE: CREATORS. Specifically: women creators on TikTok/IG/X with audiences in adult-friendly demographics (fitness, swimwear, lifestyle, beauty, alt, cosplay, OF-adjacent — but never name OF). Speak to her pain: bad brand DMs, banned from mainstream marketplaces, underpaid, exposure-deal nonsense.`
      : `TARGET AUDIENCE: BRAND MARKETERS at spirits/swimwear/lingerie/nightlife/supplement companies. Speak to their pain: can't legally use big platforms to reach this audience, manually DMing creators, contracts a mess.`;

  const ctaDirective =
    style === "trigger"
      ? `CTA STYLE (for IG/TT/FB only — Reddit gets NO CTA): Captions end with "💬 Comment ${keyword} below and I'll DM you the link (or visit bloomroster.com)". Final video on-screen-text must be EXACTLY "Comment ${keyword} ↓".`
      : `CTA STYLE (for IG/TT/FB only — Reddit gets NO CTA): Captions end with "→ bloomroster.com". Final video on-screen-text is EXACTLY "bloomroster.com".`;

  const pillarBrief = PILLAR_BRIEFS[pillar];
  const baseHashtags = PILLAR_HASHTAGS[pillar];
  const subredditOptions = SUBREDDIT_BY_PILLAR[pillar];

  const userPrompt = `Plan today's post (${today}).

PILLAR: ${pillar}
PILLAR BRIEF: ${pillarBrief}

${audienceDirective}
${ctaDirective}

POST TYPE: ${postType} (the image will be generated and the video rendered from it)
SET pillar="${pillar}", audience="${audience}", style="${style}", postType="${postType}", commentKeyword=${keyword ? `"${keyword}"` : "null"}.

REDDIT SUBREDDIT options (pick ONE for this post): ${subredditOptions.map((s) => `r/${s}`).join(", ")}

HASHTAGS: must include these base tags plus 3-5 niche-specific: ${baseHashtags.join(", ")}

⚠️ CAPTION STRUCTURE — STRICTLY ENFORCED:
The "caption" field MUST be an object with these EXACT 6 keys, each its own string/object:
  - caption.instagram (string)
  - caption.tiktok (string)
  - caption.facebook (string)
  - caption.twitter (string)
  - caption.youtube (object with .title and .description)
  - caption.reddit (object with .subreddit, .title, .body)
DO NOT collapse into a single combined caption string. DO NOT merge platforms. Each platform gets its own separate, native, distinct content.

VIDEO SCRIPT: 4-6 onScreenText beats, total under 18 seconds, each text under 60 chars. The FINAL beat's "text" must be EXACTLY "${style === "trigger" ? `Comment ${keyword} ↓` : "bloomroster.com"}".

Hook rules:
- money-truth pillar: hook starts with a specific number
- industry-expose pillar: hook starts with "Why" or "Here's why"
- never start with "Hey guys" or "POV"

IMAGE PROMPT: editorial 1024x1536 portrait. Warm cream (#FAF7F2) + deep emerald (#1F4D3F) + gold (#C9A961). Editorial magazine quality, golden hour, premium materials (linen, marble, gold, velvet, glassware), Miami/South Beach lifestyle. Subjects: flat-lay still life, architectural interior, abstract gold/palm shadow, hands holding phone with dashboard mockup, overhead workspace. NO PEOPLE in revealing clothing. NO body close-ups. End with: "No text, no lettering, no watermarks, no signage, no captions, no logos."

Now call submit_post_plan with the full plan.`;

  // Build the conversation. We may add a correction turn if Zod validation fails.
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userPrompt },
  ];

  const MAX_ATTEMPTS = 3;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const resp = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
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
      if (attempt > 1) {
        console.log(`[planner] succeeded on attempt ${attempt}`);
      }
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

    // Re-prompt Claude with the validation errors so it can correct itself
    const issuesSummary = result.error.issues
      .map(
        (i) =>
          `- Field "${i.path.join(".") || "(root)"}": ${i.message} (got: ${
            "received" in i ? i.received : "?"
          })`
      )
      .join("\n");

    messages.push(
      {
        role: "assistant",
        content: [toolUse],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `Schema validation failed. Fix these issues and call submit_post_plan again:\n\n${issuesSummary}\n\nThe "caption" field MUST be an object with separate string/object values for each of: instagram, tiktok, facebook, twitter, youtube, reddit. Do not collapse it into a single string.`,
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
