"use client";

type PreviewScreenProps = {
  mask: string | null;
  countdownSec: number | null;
  playerCount: number;
};

export default function PreviewScreen({
  mask,
  countdownSec,
  playerCount,
}: PreviewScreenProps) {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-10 pb-28 text-center">
      <p className="text-3xl font-semibold text-zinc-900 [font-family:'Archivo_Black',sans-serif] sm:text-4xl">
        Remember the mask, you will need to build a face matching the mask.
      </p>
      <div className="mt-4 flex w-full items-center justify-center px-2 sm:px-6">
        {mask ? (
          <img
            src={`/masks/${mask}`}
            alt="Mask preview"
            className="h-[40vh] w-full max-w-3xl object-contain sm:h-[48vh]"
          />
        ) : (
          <div className="flex h-[40vh] w-full max-w-3xl items-center justify-center rounded-2xl border border-dashed border-zinc-900/20 text-sm text-zinc-500 sm:h-[48vh]">
            Waiting for mask...
          </div>
        )}
      </div>
      <p className="text-4xl font-semibold text-zinc-950 [font-family:'Archivo_Black',sans-serif]">
        {countdownSec !== null ? `${countdownSec}s` : "--"}
      </p>
      <div className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-3xl items-center justify-between border-t border-white/60 bg-white/80 px-6 py-4 text-sm text-zinc-700 backdrop-blur">
        <span>Players connected</span>
        <span className="text-lg font-semibold text-zinc-900">
          {playerCount}
        </span>
      </div>
    </div>
  );
}
