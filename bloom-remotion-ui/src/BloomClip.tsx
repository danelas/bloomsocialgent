import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { z } from "zod";

const onScreenTextSchema = z.object({
  text: z.string(),
  startSeconds: z.number().min(0),
  durationSeconds: z.number().min(0.1),
});

const PILLARS = [
  "money-truth",
  "industry-expose",
  "bloom-bts",
  "creator-coaching",
  "aesthetic-mood",
] as const;

export const bloomClipSchema = z.object({
  backgroundImage: z.string(),
  pillar: z.enum(PILLARS),
  hook: z.string(),
  body: z.string(),
  cta: z.string(),
  onScreenText: z.array(onScreenTextSchema),
  musicFile: z.string(),
  musicVolume: z.number().min(0).max(1),
});

export type BloomClipProps = z.infer<typeof bloomClipSchema>;
type OnScreenText = z.infer<typeof onScreenTextSchema>;

// Brand palette
const CREAM = "#FAF7F2";
const EMERALD = "#1F4D3F";
const GOLD = "#C9A961";
const CHARCOAL = "#1A1A1A";

const toSrc = (p: string): string => {
  if (/^(https?:|file:|data:)/.test(p)) return p;
  return staticFile(p);
};

const pickFontSize = (text: string): number => {
  const len = text.length;
  if (len <= 12) return 110;
  if (len <= 22) return 88;
  if (len <= 36) return 70;
  if (len <= 52) return 58;
  return 48;
};

const isCtaText = (text: string): boolean =>
  /bloomroster\.com|comment\s+(roster|brand)/i.test(text);

const TextOverlay: React.FC<{ item: OnScreenText; pillar: string }> = ({
  item,
  pillar,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = Math.round(item.durationSeconds * fps);
  const fadeFrames = Math.min(8, Math.floor(durationFrames / 4));

  const opacity = interpolate(
    frame,
    [0, fadeFrames, durationFrames - fadeFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const translateY = interpolate(frame, [0, fadeFrames], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isCta = isCtaText(item.text);
  const fontSize = pickFontSize(item.text);

  // Aesthetic-mood pillar uses lighter touch (less aggressive overlay)
  const isAesthetic = pillar === "aesthetic-mood";
  const cardBg = isCta
    ? EMERALD
    : isAesthetic
      ? "rgba(26, 26, 26, 0.55)"
      : CREAM;
  const cardText = isCta || isAesthetic ? CREAM : CHARCOAL;
  const accentColor = isCta ? GOLD : EMERALD;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "92%",
          padding: "40px 56px",
          borderRadius: 24,
          backgroundColor: cardBg,
          boxShadow: isCta
            ? `0 30px 80px rgba(0,0,0,0.45), inset 0 0 0 2px ${GOLD}`
            : "0 20px 60px rgba(0,0,0,0.35)",
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        {/* gold accent dot for non-CTA cards */}
        {!isCta && (
          <div
            style={{
              position: "absolute",
              top: -10,
              left: 56,
              width: 16,
              height: 16,
              borderRadius: 999,
              backgroundColor: GOLD,
              boxShadow: `0 0 24px ${GOLD}`,
            }}
          />
        )}
        <div
          style={{
            color: cardText,
            fontSize,
            fontWeight: 700,
            fontFamily: "Georgia, 'Times New Roman', serif",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {item.text}
        </div>
        {isCta && (
          <div
            style={{
              marginTop: 18,
              color: accentColor,
              fontSize: 28,
              fontWeight: 600,
              fontFamily: "Helvetica, Arial, sans-serif",
              letterSpacing: 4,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            Bloom Roster
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

const BrandCorner: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 60,
      left: 60,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 20px",
      borderRadius: 999,
      backgroundColor: "rgba(26, 26, 26, 0.5)",
      backdropFilter: "blur(12px)",
    }}
  >
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: 999,
        backgroundColor: GOLD,
      }}
    />
    <div
      style={{
        color: CREAM,
        fontSize: 22,
        fontWeight: 600,
        fontFamily: "Georgia, serif",
        letterSpacing: "-0.01em",
      }}
    >
      Bloom Roster
    </div>
  </div>
);

export const BloomClip: React.FC<BloomClipProps> = ({
  backgroundImage,
  pillar,
  onScreenText,
  musicFile,
  musicVolume,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const fadeOutFrames = Math.round(0.5 * fps);
  const fadeOpacity = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle Ken Burns zoom
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      <AbsoluteFill style={{ opacity: fadeOpacity, overflow: "hidden" }}>
        <Img
          src={toSrc(backgroundImage)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
        {/* warm cream gradient veil — keeps text legible without killing the image */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(31,77,63,0.25) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 65%, rgba(31,77,63,0.55) 100%)",
          }}
        />
      </AbsoluteFill>

      <BrandCorner />

      {musicFile ? <Audio src={staticFile(musicFile)} volume={musicVolume} /> : null}

      {onScreenText.map((item, i) => (
        <Sequence
          key={i}
          from={Math.round(item.startSeconds * fps)}
          durationInFrames={Math.round(item.durationSeconds * fps)}
        >
          <TextOverlay item={item} pillar={pillar} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
