import {useEffect} from "react";
import VoteScreen from "./VoteScreen";
import PlayerStageShell from "@/app/components/screens/player/PlayerStageShell";

type VoteEntry = {
  playerId: number;
  name: string;
  emoji: number | null;
  placements: {id: string; x: number; y: number}[];
};

export default function PlayerVoteRoom({
  onReady,
  mask,
  entries,
  counts,
  likedTargets,
  countdownSec,
  showMaskOnVote,
  onVote,
}: {
  onReady?: () => void,
  mask: string | null,
  entries: VoteEntry[],
  counts: Record<number, number>,
  likedTargets: Record<number, boolean>,
  countdownSec: number | null,
  showMaskOnVote?: boolean,
  onVote: (targetPlayerId: number) => void,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10">
        <div className="pattern-orbit-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 vignette-strong" />
      </div>
      <PlayerStageShell>
        <VoteScreen
          mask={mask}
          entries={entries}
          counts={counts}
          likedTargets={likedTargets}
          countdownSec={countdownSec}
          showMaskOnVote={showMaskOnVote}
          onVote={onVote}
        />
      </PlayerStageShell>
    </div>
  );
}
