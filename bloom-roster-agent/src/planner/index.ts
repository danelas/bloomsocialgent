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

// Best-fit subreddits per pillar. Picked for actually allowing
// founder/creator/marketing content without nuking promo accounts.
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

  // Per-platform content variants. Each platform has its own culture; what
  // works on TikTok flops on Reddit. Generate native content for each.
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

const SYSTEM = `You plan daily social content for Bloom Roster (bloomroster.com), the first marketplace built for adult-friendly brand sponsorships and the creators who actually move premium audiences.

Bloom Roster connects creators (whose audiences include adult-friendly demographics — fitness, lifestyle, swimwear, alt, cosplay, beauty, lingerie, OF-adjacent) with brands in categories that mainstream influencer platforms ban: spirits, swimwear, lingerie, nightlife, supplements, cannabis, vape, hookah, hospitality, jewelry.

Brand voice: Premium · Insider · Smart · Confident. Think Modern Retail meets a finance Tok account meets a creator coach. We know money, we know the industry, we tell the truth nobody else will.

CRITICAL SFW + PLATFORM-SAFETY GUARDRAILS (do NOT violate, ever):
1. Never mention "OnlyFans," "porn," "explicit," "NSFW," "sex worker," or "adult content" by name. Use coded language: "the platforms we serve," "subscription creators," "premium audiences," "adult-friendly creators," "the categories mainstream platforms ban."
2. Never name specific competitor platforms (Aspire, GRIN, Collabstr, #paid, etc.) on screen or in captions — refer to them as "the big platforms," "the mainstream marketplaces," or "the legacy platforms."
3. The image prompt must NEVER produce thirst content, bikini shots, suggestive poses, body close-ups, or anything that could be flagged as adult-adjacent. Pure editorial only.
4. No vulgarity. No slang that reads cheap.

PER-PLATFORM CULTURE (this matters — do NOT just copy-paste the same caption everywhere):

INSTAGRAM (Reels + feed): Aspirational founder voice. 200-500 words OK. Open with the hook line, build the case in 3-5 short paragraphs, end with the CTA. Emoji sparingly. Save-worthy. People READ Instagram captions.

TIKTOK: Punchy. <150 chars. No hashtags inline (those go in the field separately). Hook-first. Casual. Drops mid-sentence. Read like a conspiratorial DM, not a press release.

FACEBOOK: Slightly older skewing. Use the IG caption but trim to ~150 words and remove emoji. More descriptive context, less brand-voice.

TWITTER / X: Text-FIRST. <240 chars. NO hashtags (they tank reach on X). Write it like a quote-tweet bait — a single bold claim or stat that someone wants to share. X is adult-friendly so language can be more direct than IG.

YOUTUBE SHORTS: SEO-loaded title with creator-economy keywords. Description should be 2-3 sentences with the URL.

REDDIT (CRITICAL — DIFFERENT RULES):
- Reddit nukes promo accounts. The post must read as GENUINE first-person value, not advertising.
- NEVER include "bloomroster.com" or any direct URL in the body. The link goes in a comment AFTER the post lands. Body has zero CTA.
- Title sounds native: a curious observation, a question, a data finding. Never starts with "🔥" or "Just launched" or "Check out". Examples that work: "What spirits brands actually pay creators in 2026 (data from 50 briefs I reviewed)" / "Why every major influencer marketplace banned the most engaged audience on the internet" / "I tracked 30 days of brand briefs in an underserved niche — here's what brands are paying for"
- Body is 200-600 words, first-person, value-first. Share specific numbers, frameworks, observations. Mention "I run a marketplace called Bloom Roster" ONCE in passing if at all — better to leave it out entirely and let it come up in comments.
- Subreddit choice matters — pick ONE subreddit per post that fits the pillar.

Return JSON only, matching the schema provided by the caller.`;

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
      ? `TARGET AUDIENCE: CREATORS. Specifically: women creators on TikTok/IG/X with audiences in adult-friendly demographics (fitness, swimwear, lifestyle, beauty, alt, cosplay, OF-adjacent — but never name OF). Speak to her pain: bad brand DMs, being banned from mainstream marketplaces, being underpaid, no infrastructure, exposure-deal nonsense. The implicit promise: Bloom Roster pays real money, treats creators like professionals, opens doors brands keep locked.`
      : `TARGET AUDIENCE: BRAND MARKETERS at spirits/swimwear/lingerie/nightlife/supplement companies. Speak to their pain: their team can't legally use the big platforms to reach this audience, they're DMing creators manually, contracts are a mess, results are unmeasured. The implicit promise: Bloom Roster is the compliant, contracted, vetted infrastructure they've been improvising.`;

  const ctaDirective =
    style === "trigger"
      ? `CTA STYLE (for IG/TT/FB only — Reddit gets NO CTA): Caption ends with "💬 Comment ${keyword} below and I'll DM you the link (or visit bloomroster.com)". Final video on-screen-text must be EXACTLY "Comment ${keyword} ↓". The trigger keyword ${keyword} must appear clearly.`
      : `CTA STYLE (for IG/TT/FB only — Reddit gets NO CTA): Caption ends with "→ bloomroster.com". Final video on-screen-text is EXACTLY "bloomroster.com".`;

  const pillarBrief = PILLAR_BRIEFS[pillar];
  const baseHashtags = PILLAR_HASHTAGS[pillar];
  const subredditOptions = SUBREDDIT_BY_PILLAR[pillar];

  const resp = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Plan today's post (${today}).

Pillar: **${pillar}**
Pillar brief: ${pillarBrief}

${audienceDirective}
${ctaDirective}

Reddit subreddit options for this pillar (pick one): ${subredditOptions.map((s) => `r/${s}`).join(", ")}

Output ONLY a JSON object with:
{
  "pillar": "${pillar}",
  "audience": "${audience}",
  "style": "${style}",
  "postType": "${postType}",
  "commentKeyword": ${keyword ? `"${keyword}"` : "null"},
  "theme": string (a 2-4 word internal label, e.g. "swimwear-rates", "aspire-ban-truth", "first-brief", "contract-clause", "miami-mood"),
  "caption": {
    "instagram": string (200-500 words, hook-first, 3-5 short paragraphs, ends with the ${style} CTA above),
    "tiktok": string (<150 chars, punchy, no inline hashtags, ends with the ${style} CTA but compressed),
    "facebook": string (~150 words, similar to IG but trimmed, fewer/no emoji, ends with the ${style} CTA),
    "twitter": string (<240 chars, NO hashtags, single bold claim/stat, end with "→ bloomroster.com" only — no comment-trigger CTA on X, that doesn't work there),
    "youtube": {
      "title": string (60-80 chars, SEO-loaded with creator-economy keywords, includes the hook),
      "description": string (2-3 sentences, includes "→ bloomroster.com" at end)
    },
    "reddit": {
      "subreddit": string (one of: ${subredditOptions.map((s) => `"${s}"`).join(", ")}),
      "title": string (Reddit-native — observation, question, or data finding. NEVER starts with emoji, "Just launched," "Check out," etc. Sounds like a real person sharing learning),
      "body": string (200-600 words, first-person, value-first, ZERO direct CTA, NO bloomroster.com URL in body, mentions "Bloom Roster" only in passing if at all. Share specific numbers/frameworks/observations from the pillar topic)
    }
  },
  "hashtags": string[] (8-12 strings, no # symbol, used for IG/TT/FB only — must include these base tags: ${baseHashtags.join(", ")}, plus 3-5 niche-specific tags),
  "imagePrompt": string (detailed prompt for gpt-image-1, 1024x1536 portrait. Aesthetic: warm cream background (#FAF7F2) with deep emerald (#1F4D3F) and gold (#C9A961) accents, editorial magazine quality, golden hour light, premium materials (linen, marble, gold, velvet, glassware), Miami/South Beach lifestyle adjacent. Subject options: (a) flat-lay still life — premium objects on linen or marble; (b) architectural/interior — luxury hospitality space, soft daylight; (c) abstract — gold-leaf textures, palm shadows, water reflections; (d) hands holding a phone showing a clean dashboard mockup; (e) overhead workspace with notebook, gold pen, espresso. NO PEOPLE IN REVEALING CLOTHING. NO BODY CLOSE-UPS. NO SUGGESTIVE POSES. Pure editorial. End with: "No text, no lettering, no watermarks, no signage, no captions, no logos.")
,
  "videoScript": {
    "hook": string (first 1.5 sec — must stop scroll. For money-truth pillar START WITH A NUMBER. For industry-expose START WITH "Why" or "Here's why". Never start with "Hey guys" or "POV").,
    "body": string (5-15 sec — voiceover the founder would say in first person),
    "cta": string (final 2 sec, ${style === "trigger" ? `must mention commenting "${keyword}"` : `"bloomroster.com"`}),
    "onScreenText": [
      {"text": string, "startSeconds": number, "durationSeconds": number}
      // 4-6 beats total, total length under 18 seconds. Each text under 60 chars. The FINAL beat's "text" must be EXACTLY "${style === "trigger" ? `Comment ${keyword} ↓` : "bloomroster.com"}".
    ]
  }
}`,
      },
    ],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("planner: no JSON in response");

  return PostPlanSchema.parse(JSON.parse(jsonMatch[0]));
}
