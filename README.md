# Bloom Social Agent

The daily content engine for Bloom Roster. Generates 3 TikTok / Instagram /
YouTube / Facebook posts per day, fully automated, on a GitHub Actions cron.

The website lives in a separate repo: [danelas/bloomroster](https://github.com/danelas/bloomroster).

## Architecture

```
plan (Claude) → image (gpt-image-1) → video (Remotion) → schedule (Upload-Post)
```

Two sibling projects:

### `bloom-roster-agent/` — Orchestrator

Node + tsx. Plans posts with Claude (5 content pillars, SFW guardrails baked
into the system prompt), generates editorial flat-lay backgrounds with
gpt-image-1, invokes the sibling Remotion project to render vertical 9:16 MP4s,
then schedules them to TikTok / IG / YouTube / Facebook via the Upload-Post API.

```bash
cd bloom-roster-agent
npm install
cp .env.example .env   # fill in API keys

# preview only — generates plan + image + video, NO upload
npx tsx src/index.ts --dry-run

# real run — schedules to all connected platforms
npx tsx src/index.ts

# single slot
npx tsx src/index.ts --slot=A
```

### `bloom-remotion-ui/` — Video renderer

Remotion composition for vertical 9:16 social video. Renders the `BloomClip`
composition with cream/emerald/gold palette and animated text overlays.
Invoked by the agent — no need to run directly.

```bash
cd bloom-remotion-ui
npm install
npm run dev   # opens Remotion Studio for visual editing
```

## Daily automation

`.github/workflows/daily.yml` runs the agent at **5:30 AM ET** every day.

Required repository secrets (Settings → Secrets and variables → Actions):

- `ANTHROPIC_API_KEY` — Claude planner
- `OPENAI_API_KEY` — gpt-image-1 backgrounds
- `UPLOAD_POST_API_KEY` — TikTok/IG/YT/FB scheduling
- `UPLOAD_POST_USER` — your Upload-Post profile name

You can also trigger the workflow manually (Actions tab → Daily content
generation → Run workflow) with optional `dry_run` / single-`slot` args.
Every run uploads the preview folder (captions, plan.json, image, MP4) as a
build artifact for inspection.

## Daily slots (ET)

| Slot | Time   | Type          | Platforms                       |
|------|--------|---------------|---------------------------------|
| A    | 9:00   | video         | TikTok                          |
| B    | 12:00  | image + video | IG/FB image · TT/YT video       |
| C    | 20:00  | video         | TikTok / IG / YouTube / Facebook |

## Content pillars

Rotate by day index (every 5 days the cycle repeats):

- **money-truth** — specific dollar figures, leads with a number
- **industry-expose** — gatekeeping truths, insider tone
- **bloom-bts** — founder-perspective build-in-public
- **creator-coaching** — tactical free value (highest save rate)
- **aesthetic-mood** — pure brand vibe, low frequency

## SFW + platform-safety guardrails (enforced in the planner system prompt)

1. Never mention "OnlyFans," "porn," "explicit," "NSFW," "sex worker"
2. Never name competitor platforms (Aspire, GRIN, Collabstr, #paid) — referred
   to as "the big platforms" / "legacy marketplaces"
3. Image prompts never produce thirst content — pure editorial only
4. CTA always either "Comment ROSTER/BRAND" or "→ bloomroster.com"

## Brand palette

- Cream: `#FAF7F2`
- Emerald: `#1F4D3F`
- Gold: `#C9A961`
- Charcoal: `#1A1A1A`
