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
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-zinc-900/10 bg-white/80 px-5 py-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Waiting Room
        </p>
        <p className="mt-3 text-4xl font-semibold text-zinc-950 [font-family:'Archivo_Black',sans-serif]">
          {countdownSec !== null ? `${countdownSec}s` : "--"}
        </p>
        <p className="mt-2 text-sm text-zinc-600">Countdown to start</p>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-zinc-900/10 bg-white/80 px-5 py-4 text-sm text-zinc-700">
        <span>Players connected</span>
        <span className="text-lg font-semibold text-zinc-900">
          {playerCount}
        </span>
      </div>
    </div>
  );
}
