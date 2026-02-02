import {useEffect, useState} from "react";
import BuildScreen from "./BuildScreen";
import PlayerStageShell from "@/app/components/screens/player/PlayerStageShell";

export default function PlayerBuildRoom({
  onReady,
  mask,
  partLimit,
  countdownSec,
  onPartDrop,
}: {
  onReady?: () => void,
  mask: string | null,
  partLimit: number | null,
  countdownSec: number | null,
  onPartDrop: (partId: string, xPercent: number, yPercent: number) => void,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const [stageScale, setStageScale] = useState(1);

  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10">
        <div className="animated-squares-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_0%,_rgba(0,0,0,0.45)_60%,_rgba(0,0,0,0.75)_100%)]" />
      </div>
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
}
