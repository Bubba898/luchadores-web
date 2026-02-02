import {useEffect} from "react";
import PreviewScreen from "./PreviewScreen";
import PlayerStageShell from "@/app/components/screens/player/PlayerStageShell";

export default function PlayerPreviewRoom({
  onReady,
  mask,
  countdownSec,
  playerCount,
}: {
  onReady?: () => void,
  mask: string | null,
  countdownSec: number | null,
  playerCount: number,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10">
        <div className="waves-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 vignette-strong" />
      </div>
      <PlayerStageShell>
        <PreviewScreen
          mask={mask}
          countdownSec={countdownSec}
          playerCount={playerCount}
        />
      </PlayerStageShell>
    </div>
  );
}
