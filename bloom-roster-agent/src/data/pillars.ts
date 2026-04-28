// Five content pillars for Bloom Roster's TikTok + Instagram engine.
// These rotate by day to give the algorithm variety and the audience reasons
// to keep watching across visit patterns.

export const PILLARS = [
  "money-truth",
  "industry-expose",
  "bloom-bts",
  "creator-coaching",
  "aesthetic-mood",
] as const;

export type Pillar = (typeof PILLARS)[number];

export const PILLAR_BRIEFS: Record<Pillar, string> = {
  "money-truth": `Real, specific dollar figures from the adult-friendly creator economy. What creators in [niche] actually earn from brand deals. What spirits brands pay for swimwear creators. What Don Julio paid the last 3 creators they hired. The hook is always a number in the first 1.5 seconds. Shock + specificity = shares + saves. Frame numbers as facts the viewer didn't know — never as bragging.`,

  "industry-expose": `Truth-telling about the gatekeeping in the influencer industry. Why mainstream marketplaces (Aspire, GRIN, Collabstr — refer to them as "the big platforms" without naming, to avoid algorithmic flagging) ban this entire category. What brand marketers say off the record about wanting these audiences. The structural arbitrage that exists because of the gap. Tone: insider, slightly conspiratorial, factual. Never bitter or whiny.`,

  "bloom-bts": `Founder-perspective behind-the-scenes of building Bloom Roster. "Brand briefs that came in this week." "Just signed creator #X." "Day in the life of building a creator marketplace in Miami." Builds trust + parasocial pull. Should feel like watching a Shark Tank winner build the company in public. Talking head + B-roll of laptop, dashboard, Miami palm trees, coffee, etc.`,

  "creator-coaching": `Genuinely useful tactical content for creators. How to price brand deals. What contract clauses to never accept. How to negotiate usage rights. What brands actually pay for vs. what they ask for. These are the highest-save-rate posts because they double as a free reference creators come back to. Pure value, no pitch — the implicit pitch is "we know this stuff cold, come join."`,

  "aesthetic-mood": `Pure brand-vibe content. Miami/South FL lifestyle, palm shadows, golden hour, premium materials, the Bloom Roster visual world. Lower frequency (1-2/week max) but reinforces the premium positioning every time. Slow pace, cinematic, almost no text. Music-driven. The point is to make creators feel "I want to be associated with this brand" before they even know what we do.`,
};

export const PILLAR_HASHTAGS: Record<Pillar, string[]> = {
  "money-truth": [
    "CreatorEconomy",
    "BrandDeals",
    "InfluencerMarketing",
    "CreatorIncome",
    "ContentCreator",
  ],
  "industry-expose": [
    "CreatorEconomy",
    "InfluencerMarketing",
    "BrandDeals",
    "CreatorAdvice",
    "MarketingTruth",
  ],
  "bloom-bts": [
    "BuildInPublic",
    "CreatorEconomy",
    "MiamiStartup",
    "Founder",
    "Marketplace",
  ],
  "creator-coaching": [
    "CreatorTips",
    "BrandDeals",
    "CreatorAdvice",
    "InfluencerTips",
    "ContentCreator",
  ],
  "aesthetic-mood": [
    "Miami",
    "SouthFlorida",
    "CreatorLife",
    "Aesthetic",
    "BloomRoster",
  ],
};
