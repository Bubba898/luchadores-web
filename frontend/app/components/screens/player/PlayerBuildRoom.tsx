import {useEffect, useState} from "react";
import BuildScreen from "./BuildScreen";
import PlayerStageShell from "@/app/components/screens/player/PlayerStageShell";

export default function PlayerBuildRoom({
  onReady,
  mask,
  partLimit,
  countdownSec,
  onPartDrop,
  layer = "full",
}: {
  onReady?: () => void,
  mask: string | null,
  partLimit: number | null,
  countdownSec: number | null,
  onPartDrop: (partId: string, xPercent: number, yPercent: number) => void,
  layer?: "background" | "content" | "full",
}) {
  useEffect(() => {
    if (layer !== "background") {
      onReady?.();
    }
  }, [onReady, layer]);

  const [stageScale, setStageScale] = useState(1);

  const background = (
    <div className={`absolute inset-0 ${layer === "background" ? "" : "-z-10"}`}>
      <div className="animated-squares-bg h-full w-full" />
      <div className="pointer-events-none absolute inset-0 vignette-strong" />
    </div>
  );

  const content = (
    <div className="relative min-h-screen text-white">
      <PlayerStageShell onScaleChange={setStageScale}>
        <BuildScreen
          mask={mask}
          partLimit={partLimit}
          countdownSec={countdownSec}
          stageScale={stageScale}
          onPartDrop={onPartDrop}
        />
      </PlayerStageShell>
    </div>
  );

  if (layer === "background") {
    return background;
  }
  if (layer === "content") {
    return content;
  }
  return (
    <>
      {background}
      {content}
    </>
  );
}
