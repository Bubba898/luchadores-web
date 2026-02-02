import {useEffect} from "react";
import Button from "@/app/components/Button";
import ResultsScreen from "@/app/components/screens/player/ResultsScreen";

type Winner = {
  playerId: number;
  name: string;
  emoji: number | null;
  placements: {id: string; x: number; y: number}[];
};

export default function HostResultsRoom({
  onReady,
  mask,
  winner,
  onRestart,
}: {
  onReady?: () => void,
  mask: string | null,
  winner: Winner | null,
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
      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12 sm:px-10 sm:py-16">
        <ResultsScreen mask={mask} winner={winner} />
        {onRestart ? (
          <div className="pointer-events-none absolute top-40 left-1/2 flex -translate-x-1/2 justify-center">
            <div className="pointer-events-auto">
              <Button onClick={onRestart} className="min-w-[200px]">
                Restart
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
