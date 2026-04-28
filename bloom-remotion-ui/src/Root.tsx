import { Composition } from "remotion";
import { BloomClip, bloomClipSchema, type BloomClipProps } from "./BloomClip.tsx";

const defaultProps: BloomClipProps = {
  backgroundImage: "current-bg.png",
  pillar: "money-truth",
  hook: "Swimwear creators with 50k followers earn $1,200 per brand deal.",
  body: "Most are getting offered $200. The gap is the marketplace.",
  cta: "Apply at bloomroster.com",
  onScreenText: [
    { text: "$1,200 per deal", startSeconds: 0, durationSeconds: 2.2 },
    { text: "Most get offered $200", startSeconds: 2.2, durationSeconds: 2.4 },
    { text: "The gap is the marketplace", startSeconds: 4.6, durationSeconds: 2.6 },
    { text: "bloomroster.com", startSeconds: 7.2, durationSeconds: 2.8 },
  ],
  musicFile: "",
  musicVolume: 0.4,
};

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="BloomClip"
        component={BloomClip}
        durationInFrames={600} // 20s at 30fps — covers most pillar scripts
        fps={30}
        width={1080}
        height={1920}
        schema={bloomClipSchema}
        defaultProps={defaultProps}
      />
    </>
  );
};
