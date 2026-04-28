import { spawn } from "node:child_process";
import { copyFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { PostPlan } from "../planner/index.ts";

const REMOTION_DIR = resolve(process.cwd(), "../bloom-remotion-ui");
const REMOTION_PUBLIC = resolve(REMOTION_DIR, "public");

export async function renderVideo(
  plan: PostPlan,
  imagePath: string,
  outPath: string
): Promise<string> {
  const stagedName = "current-bg.png";
  await copyFile(imagePath, resolve(REMOTION_PUBLIC, stagedName));

  const props = {
    backgroundImage: stagedName,
    pillar: plan.pillar,
    hook: plan.videoScript.hook,
    body: plan.videoScript.body,
    cta: plan.videoScript.cta,
    onScreenText: plan.videoScript.onScreenText,
    musicFile: "",
    musicVolume: 0.4,
  };

  const propsPath = resolve(dirname(outPath), "props.json");
  await writeFile(propsPath, JSON.stringify(props), "utf8");

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const proc = spawn(
      "npx",
      ["remotion", "render", "BloomClip", outPath, `--props=${propsPath}`],
      { cwd: REMOTION_DIR, stdio: "inherit", shell: true }
    );
    proc.on("exit", (code) =>
      code === 0 ? resolvePromise() : rejectPromise(new Error(`remotion exited ${code}`))
    );
  });

  return outPath;
}
