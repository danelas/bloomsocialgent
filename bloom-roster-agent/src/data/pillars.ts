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

// Curated image subjects per pillar — one is picked randomly per run.
// Goal: massive visual variety, all on-brand (cream/emerald/gold, editorial,
// no thirst content, no people in revealing clothing). Specific details so
// the model can't fall back on "generic flat-lay with notebook."
export const IMAGE_SUBJECTS_BY_PILLAR: Record<Pillar, string[]> = {
  "money-truth": [
    "Top-down editorial flat-lay: stack of crisp $100 bills wrapped tight with a thin gold paperclip, on a warm cream linen surface (#FAF7F2), single dried palm frond shadow falling diagonally, golden hour light from upper left. Deep emerald velvet ribbon coiled in upper corner. No text on the bills (abstracted).",
    "Close-up still life: gold-rimmed crystal coupe glass half-filled with champagne, single diamond stud earring resting on the marble surface beside it, cream silk fabric draped at edge, soft warm sunset light, deep emerald shadow.",
    "Architectural close-up: row of gleaming brass mailbox doors on cream stone wall, golden hour light glinting off the brass, palm tree shadow falling across — visual metaphor for inboxes filling with offers.",
    "Overhead: vintage rolodex card holder open, displaying premium business cards (text illegible), gold pen and espresso cup beside it, cream marble surface, warm directional light.",
    "Side view: stack of three matte black wax-sealed envelopes tied with deep emerald silk ribbon, gold wax bloom seal visible, single sprig of dried lavender on top, on cream linen.",
  ],
  "industry-expose": [
    "Architectural shot: closed cream stone wall with single ornate brass keyhole at center, golden hour shadow of a palm leaf across it. Symbolic visual of gatekeeping. Deep emerald shrub at lower edge.",
    "Top-down: oversized cream manila folder closed with deep emerald wax seal embossed with abstract bloom mark, single gold paper clip, on dark walnut wood surface, warm directional light.",
    "Close-up: half-open vintage briefcase showing cream silk lining, single gold key resting inside, deep emerald velvet underneath, palm leaf shadow across the marble surface beneath.",
    "Side view: tarnished old brass key on left, polished new gold key on right, both resting on cream linen with deep emerald velvet underneath, warm sunset light separating them with shadow.",
    "Architectural detail: gilded iron gate (closed), warm sunset light filtering through the bars, cream stucco wall behind, casting long ornate shadow patterns onto cream marble floor in foreground.",
  ],
  "bloom-bts": [
    "Overhead workspace: open MacBook with abstract dashboard interface (no readable text), gold pen, espresso cup with cream rim, single dried palm frond across corner, warm linen surface, golden hour sun from left.",
    "Sunset Miami balcony scene: crystal champagne flute on glass railing, deep emerald palm fronds in soft focus foreground, golden cream sky behind, distant cream Art Deco buildings.",
    "Hotel suite desk: closed leather portfolio with gold corner accents, single white orchid in clear bud vase, gold pen resting diagonally, cream stucco wall behind, soft daylight from balcony door.",
    "Hands (no face, only forearms visible) holding an iPhone showing a clean abstract dashboard mockup, warm cream wall behind, gold watch on wrist, cream linen sleeve.",
    "Close-up: cream business cards fanned across cream linen, top card embossed only with a subtle gold bloom mark (no readable text), gold pen beside, warm sunset shadow.",
    "Aerial cafe table: two espresso cups, single croissant on cream plate, leather notebook closed with gold band, cream linen tablecloth, palm shadow, golden hour.",
  ],
  "creator-coaching": [
    "Open premium leather planner with hand-drawn abstract diagrams (no readable text or numbers), gold pen across the page, on cream marble desk, soft window light, single white orchid in background.",
    "Top-down: vintage Olivetti typewriter on cream linen, blank cream paper curling from the roller (no typed text), brass espresso cup, gold pen — implied 'how-to writing.'",
    "Stack of three premium hardcover books with blank cream dust jackets, single dried palm frond resting across them, brass desk lamp glowing warmly in the corner.",
    "Hands writing in a leather journal at a golden hour cafe table, forearms visible only (no face, no skin close-up), gold watch and cream sleeve, cream linen tablecloth.",
    "Close-up of a calligraphy nib pen mid-stroke on cream paper, abstract gold-ink curves visible (not letters), warm directional sunlight casting soft shadow.",
    "Top-down: open lined notebook with abstract bullet-list checkmarks in gold ink (no readable words), espresso, single coin of gold leaf decoratively placed, on cream linen.",
  ],
  "aesthetic-mood": [
    "Pure abstract macro: scattered gold leaf flakes on warm cream linen, single deep palm shadow falling diagonally across, golden hour, no other elements.",
    "Aerial shot of a turquoise resort pool surface with floating gold leaf and a single cream cabana fabric edge in periphery, soft ripples catching warm sunset light.",
    "Marble table close-up at sunset: single perfect water droplet catching warm golden reflection, deep emerald shadow underneath, no other elements.",
    "Empty cream linen-draped table at golden hour on a Miami balcony, single white orchid in bud vase, palm tree shadow falling diagonally across the table.",
    "Long shadow of a single palm frond stretching across a cream stucco wall at sunset, all warm tones, deep emerald shrub at base.",
    "Close-up of a deep emerald velvet curtain catching golden hour light, single gold tassel hanging, cream marble floor at the bottom edge.",
    "Underwater-style shot: gold leaf suspended in a clear glass cube of water, on cream marble, sunset light refracting through making prisms.",
  ],
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
