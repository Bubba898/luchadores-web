"use client";

type WaitingRoomProps = {
  countdownSec: number | null;
  playerCount: number;
};

export default function WaitingRoom({
  countdownSec,
  playerCount,
}: WaitingRoomProps) {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 pb-24 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Waiting Room
      </p>
      <p className="text-6xl font-semibold text-zinc-950 [font-family:'Archivo_Black',sans-serif] sm:text-7xl">
        {countdownSec !== null ? `${countdownSec}s` : "--"}
      </p>
      <p className="text-lg text-zinc-600">Waiting for players to join</p>
      <div className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-3xl items-center justify-between border-t border-white/60 bg-white/80 px-6 py-4 pb-[env(safe-area-inset-bottom)] text-sm text-zinc-700 backdrop-blur">
        <span>Players connected</span>
        <span className="text-lg font-semibold text-zinc-900">
          {playerCount}
        </span>
      </div>
    </div>
  );
}
