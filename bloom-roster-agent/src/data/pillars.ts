// Five content pillars for Bloom Roster's TikTok + Instagram engine.
// These rotate by day to give the algorithm variety and the audience reasons
// to keep watching across visit patterns.

export const PILLARS = [
  "money-truth",
  "industry-expose",
  "creator-belonging",
  "niche-spotlight",
  "bloom-bts",
  "creator-coaching",
  "aesthetic-mood",
] as const;

// Niches that get spotlight posts. The planner picks ONE per niche-spotlight
// post and writes content hyper-targeted to that audience's specific pain.
export const SPOTLIGHT_NICHES = [
  {
    name: "fitness creators",
    pain: "Your gym videos get pulled for 'sexual content' because your leggings fit. Your hard work training audiences ends up shadowbanned the moment your form video shows abs. The supplement brands that should be paying you $2-5k per post won't touch the major marketplaces because they're the wrong category.",
    brandFit: "supplements, athletic wear, energy drinks, recovery products, premium fitness equipment",
  },
  {
    name: "swimwear and bikini creators",
    pain: "Your entire content category — beach, swimsuit, hot girl summer — is the literal pretext for swimwear brands to exist, but the big influencer marketplaces ban you outright. You watch swimwear brands run paid campaigns with creators half your size, half your engagement, none of your aesthetic.",
    brandFit: "swimwear, sunscreen, vacation rentals, hospitality, jewelry, sandals, hats, beach lifestyle",
  },
  {
    name: "cosplay and alt creators",
    pain: "Your engagement crushes mainstream lifestyle creators, your fan loyalty is unmatched, your audience SPENDS — but your aesthetic gets you banned from every brand-deal marketplace because some algorithm flagged 'fishnet.' The brands that worship your audience can't reach you legally through the legacy channels.",
    brandFit: "alt fashion, gothic homeware, gaming gear, energy drinks, hair dye, custom merch, conventions",
  },
  {
    name: "lifestyle creators in Miami and South FL",
    pain: "Your aesthetic IS the brand spirits, swimwear, and nightlife companies are paying for. But the marketplaces in NY/LA serve creators who look like a different world. The brands flying to Miami to shoot can't find you because no platform serves this scene.",
    brandFit: "spirits, RTDs, nightlife venues, hospitality, swimwear, jewelry, real estate developers",
  },
  {
    name: "beauty and skincare creators with edge",
    pain: "Your audience overlaps with lingerie, premium swimwear, and adult-lifestyle brands — but mainstream beauty marketplaces only push you toward Sephora-safe brands. The lingerie brands and edgier beauty drops want your audience and have the budgets, just no infrastructure to reach you.",
    brandFit: "lingerie, body care, premium skincare, fragrance, hair, salons, med-spa",
  },
  {
    name: "Latina creators",
    pain: "You hold one of the highest-engaged audiences in the creator economy — bilingual reach into US Hispanic AND LATAM markets — and brands literally beg for it. The mainstream marketplaces still treat Latina creators as 'niche' instead of 'category-defining.' Spirits brands, swimwear, beauty — they're all leaving money on the table because they can't find you efficiently.",
    brandFit: "spirits, swimwear, beauty, hospitality, music, fashion, hair, dance",
  },
  {
    name: "plus-size and curvy creators",
    pain: "Your audience converts at insane rates because your community is fierce and your trust is hard-won. But the legacy marketplaces still push you toward the same 5 'inclusive' brands while ignoring lingerie, swimwear, and lifestyle brands that would pay premium for your reach.",
    brandFit: "lingerie, swimwear, premium fashion, body-positive beauty, intimate apparel, shapewear",
  },
  {
    name: "MILF and 30+ creators",
    pain: "Your fan LTV is the highest in the industry. Your audience is older, more engaged, and actually has disposable income. But the marketplaces are obsessed with 19-year-old Gen Z creators with no purchase power. The wine, hospitality, jewelry, and luxury fashion brands paying $5k+ posts are looking right past you.",
    brandFit: "wine, premium spirits, fragrance, luxury fashion, hospitality, jewelry, watches, anti-aging skincare",
  },
  {
    name: "Twitch streamers and gaming creators",
    pain: "You get suspended for content your audience asks for, then watch brand deals go to creators with a quarter of your engagement. The energy drinks, gaming gear brands, vape companies that want you can't risk the platform association.",
    brandFit: "energy drinks, gaming peripherals, vape, hookah, streetwear, alt fashion, supplements",
  },
];

export type Pillar = (typeof PILLARS)[number];

export const PILLAR_BRIEFS: Record<Pillar, string> = {
  "money-truth": `Real, specific dollar figures from the adult-friendly creator economy. What creators in [niche] actually earn from brand deals. What spirits brands pay for swimwear creators. What Don Julio paid the last 3 creators they hired. The hook is always a number in the first 1.5 seconds. Shock + specificity = shares + saves. Frame numbers as facts the viewer didn't know — never as bragging.`,

  "industry-expose": `Truth-telling about the gatekeeping in the influencer industry. Why mainstream marketplaces (Aspire, GRIN, Collabstr — refer to them as "the big platforms" without naming, to avoid algorithmic flagging) ban this entire category. What brand marketers say off the record about wanting these audiences. The structural arbitrage that exists because of the gap. Tone: insider, slightly conspiratorial, factual. Never bitter or whiny.`,

  "niche-spotlight": `Hyper-targeted post to ONE specific creator niche (fitness, swimwear, cosplay, MILF, Latina, plus-size, gaming, beauty, lifestyle, etc.). The planner will pick a niche and supply the specific pain points + brand-fit categories. Open with that niche by name in the hook so it stops the scroll for THAT exact audience: "Fitness girls — read this." / "Swimwear creators, this is for you." / "Cosplay creators with 50k+ — your audience is worth more than you've been told." Validate their specific pain (gym videos getting flagged for "tight leggings," swimwear creators banned from the marketplaces literally built around their content, cosplay engagement crushing mainstream lifestyle but no brand infra). Then list the SPECIFIC brand categories that pay for THEIR audience. End with the standard CTA. This pillar drives application volume because targeted creators feel SEEN.`,

  "creator-belonging": `Direct, second-person address to creators who've been told they're not the right fit. Specific pain points: banned from mainstream marketplaces, shadowbanned without explanation, sent gift-card "collabs" instead of real money, locked out of brand deals their reach should command, treated as second-class because their niche is adult-friendly. Frame: "You've been told you don't fit. The truth is the platforms weren't built for you. We were." Tone: warm, validating, sister-in-the-trenches energy. NOT victim-y, NOT pity. Empowering and matter-of-fact. Hooks like: "If a brand has ever offered you a $50 gifted set instead of $1,500 for a Reel — this is for you" / "You were never the problem. The marketplace was never built for you. Until now" / "Every door the big platforms close, we build the room you actually belong in." This is the heart-of-the-brand pillar — speaks DIRECTLY to the creator's lived experience of rejection.`,

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
  "niche-spotlight": [
    "Top-down: cream linen surface with a single gold-foil RESERVED card (text rendered as abstract gold mark), single sprig of lavender, deep emerald napkin folded beside it.",
    "Architectural close-up: a single brass nameplate set into a cream stone wall, blank (no readable text), polished gold finish catching golden hour light, single palm shadow.",
    "Side view: a stack of cream envelopes tied with deep emerald silk ribbon, each sealed with a different small gold pictogram (abstract — flame, heart, leaf, star), warm directional sunlight.",
    "Overhead: a row of three matching gold-rimmed crystal coupe glasses on cream linen, each filled with a different colored cocktail (amber, rose, deep emerald-green), warm sunset light.",
    "Top-down: open vintage card catalog drawer with cream index cards (text illegible — abstract gold typography), brass handle, single dried palm frond resting across, warm wood surface.",
    "Architectural: cream stucco wall with a series of brass numbered medallions (numbers rendered as abstract gold marks), warm sunset light casting long shadow, deep emerald shrub at base.",
  ],
  "creator-belonging": [
    "Architectural shot: a single warmly lit golden door open at the end of a long cream stone hallway, golden hour light streaming through, palm shadow across the floor — symbolic of an open invitation.",
    "Cream linen banquette with a single reserved place setting: cream china, deep emerald napkin, gold cutlery, single white orchid in bud vase. Warm sunset light. Implied: a seat saved for you.",
    "Top-down: a velvet-lined cream jewelry box open, displaying a single gold key with a deep emerald silk tassel — symbolic of being given the key to a private space.",
    "Soft-focus interior: a cream velvet armchair beside a Miami window with palm shadows falling across it, warm afternoon light, single coffee cup steaming on side table — implied warmth, refuge.",
    "Architectural close-up: the words VACANCY engraved subtly in brass on a cream stone wall, small gold bell beside it, golden hour shadow — but render text as abstract gold mark NOT letters.",
    "Hands (forearms only, gold watch + cream sleeve, no skin close-up) holding open a cream folio displaying a single embossed gold-foil card with abstract bloom mark — like a member's invitation.",
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
  "creator-belonging": [
    "CreatorEconomy",
    "ContentCreator",
    "CreatorLife",
    "InfluencerMarketing",
    "BrandDeals",
  ],
  "niche-spotlight": [
    "CreatorEconomy",
    "ContentCreator",
    "BrandDeals",
    "InfluencerTips",
    "CreatorLife",
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
