import {useEffect} from "react";
import PreviewScreen from "@/app/play/PreviewScreen";
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_0%,_rgba(0,0,0,0.45)_60%,_rgba(0,0,0,0.75)_100%)]" />
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
