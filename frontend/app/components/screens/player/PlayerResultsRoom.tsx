import {useEffect} from "react";
import ResultsScreen from "@/app/play/ResultsScreen";
import PlayerStageShell from "@/app/components/screens/player/PlayerStageShell";

export default function PlayerResultsRoom({
  onReady,
  mask,
  winner,
}: {
  onReady?: () => void,
  mask: string | null,
  winner: {
    playerId: number;
    name: string;
    emoji: number | null;
    placements: {id: string; x: number; y: number}[];
  } | null,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10">
        <div className="pattern-rings-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_0%,_rgba(0,0,0,0.45)_60%,_rgba(0,0,0,0.78)_100%)]" />
      </div>
      <PlayerStageShell>
        <ResultsScreen mask={mask} winner={winner} />
      </PlayerStageShell>
    </div>
  );
}
