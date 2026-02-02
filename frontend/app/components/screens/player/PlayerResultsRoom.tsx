import {useEffect} from "react";
import ResultsScreen from "./ResultsScreen";
import PlayerStageShell from "@/app/components/screens/player/PlayerStageShell";
import Button from "@/app/components/Button";

export default function PlayerResultsRoom({
  onReady,
  mask,
  winner,
  canRestart,
  onRestart,
}: {
  onReady?: () => void,
  mask: string | null,
  winner: {
    playerId: number;
    name: string;
    emoji: number | null;
    placements: {id: string; x: number; y: number}[];
  } | null,
  canRestart?: boolean,
  onRestart?: () => void,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10">
        <div className="pattern-rings-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 vignette-strong" />
      </div>
      <PlayerStageShell>
        <div className="relative flex h-full w-full flex-col">
          <ResultsScreen mask={mask} winner={winner} />
          {onRestart && canRestart ? (
            <div className="pointer-events-none absolute top-40 left-1/2 flex -translate-x-1/2 justify-center">
              <div className="pointer-events-auto">
                <Button
                  onClick={onRestart}
                  className="min-w-[200px] scale-[0.6]"
                >
                  Restart
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </PlayerStageShell>
    </div>
  );
}
