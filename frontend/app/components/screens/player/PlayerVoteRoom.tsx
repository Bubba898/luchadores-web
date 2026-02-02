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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_rgba(0,0,0,0.45)_60%,_rgba(0,0,0,0.75)_100%)]" />
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
