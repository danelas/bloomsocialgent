# Bloom Remotion UI

Vertical 9:16 video renderer for Bloom Roster's daily TikTok/IG content. Driven
by `bloom-roster-agent` via `npx remotion render BloomClip`.

## Setup

```bash
npm install
```

## Compositions

- **BloomClip** — 1080×1920, 30fps, 10s. Background image (gpt-image-1 output)
  + animated text overlays in Bloom palette (cream / emerald / gold).

## Local preview

```bash
npm run dev
```

Opens Remotion Studio. Pick `BloomClip`, edit props live, see it animate.

## Render

Triggered by the agent. Manual:

```bash
npx remotion render BloomClip out/test.mp4 --props='{"backgroundImage":"current-bg.png","pillar":"money-truth","hook":"...","body":"...","cta":"...","onScreenText":[...],"musicFile":"","musicVolume":0.4}'
```

## Brand palette (for designers)

- Cream: `#FAF7F2`
- Emerald: `#1F4D3F`
- Gold: `#C9A961`
- Charcoal: `#1A1A1A`
