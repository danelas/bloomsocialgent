# Bloom Roster Agent

Daily content engine for Bloom Roster. Generates TikTok + Instagram posts on
autopilot using Claude (planner) → gpt-image-1 (background image) → Remotion
(video) → Upload-Post API (scheduling).

## Architecture

```
plan (Claude) → image (gpt-image-1) → video (Remotion) → schedule (Upload-Post)
```

Mirrors the Gold Touch List `social-agent` pattern but with:

- **5 content pillars** (money-truth, industry-expose, bloom-bts, creator-coaching, aesthetic-mood)
- **Creator + brand audience targeting** (rotates by day)
- **SFW guardrails baked into the system prompt** — never names OF, competitor platforms, or shows thirst content
- **Bloom palette** (cream/emerald/gold) via the `bloom-remotion-ui` sibling project
- **CTAs** point to bloomroster.com (trigger keywords ROSTER for creators, BRAND for brands)

## Setup

```bash
cd ../bloom-remotion-ui && npm install
cd ../bloom-roster-agent && npm install
cp .env.example .env
# fill in: ANTHROPIC_API_KEY, OPENAI_API_KEY, UPLOAD_POST_API_KEY, UPLOAD_POST_USER
```

## Run

```bash
# preview only — generates plan + image + video, NO upload
npm run daily:dry

# plan only — fastest, no image/video render
npm run plan-only

# full daily run — generates 3 slots and schedules to TikTok/IG/YT/FB
npm run daily

# single slot
npm run daily -- --slot=A

# force a pillar or audience
npm run daily -- --pillar=money-truth --audience=creator
```

## Schedule slots (ET)

| Slot | Time   | Type      | Platforms                      |
|------|--------|-----------|--------------------------------|
| A    | 9:00   | video     | TikTok                         |
| B    | 12:00  | image+vid | IG/FB image · TT/YT video      |
| C    | 20:00  | video     | TikTok / IG / YouTube / FB     |

## Add to cron / Task Scheduler

Run `npm run daily` once per morning around 5–6am ET. Posts are scheduled
forward to the slot times listed above.

## Critical content rules (enforced in the planner system prompt)

1. Never say "OnlyFans," "porn," "explicit," "NSFW," "sex worker"
2. Never name competitor platforms (Aspire, GRIN, Collabstr, #paid)
3. Image prompts never produce thirst content — pure editorial only
4. CTA always either "Comment ROSTER/BRAND" or "→ bloomroster.com"

## Pillars

- **money-truth** — specific dollar figures, leads with a number
- **industry-expose** — gatekeeping truths, insider tone
- **bloom-bts** — founder-perspective build-in-public
- **creator-coaching** — tactical free value (highest save rate)
- **aesthetic-mood** — pure brand vibe, low frequency
