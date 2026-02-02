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
    <div className="relative flex flex-1 flex-col items-center justify-start gap-6 pb-28 pt-6 text-center">
      <p className="text-2xl font-semibold text-zinc-900 [font-family:'Archivo_Black',sans-serif]">
        Remember the mask, you will need to build a facefor the mask.
      </p>
      <div className="mt-2 flex w-full flex-1 items-center justify-center px-2">
        {mask ? (
          <img
            src={`/masks/${mask}`}
            alt="Mask preview"
            className="h-full max-h-[50vh] w-full max-w-3xl object-contain"
          />
        ) : (
          <div className="flex h-full max-h-[50vh] w-full max-w-3xl items-center justify-center rounded-2xl border border-dashed border-zinc-900/20 text-sm text-zinc-500">
            Waiting for mask...
          </div>
        )}
      </div>
      <p className="text-3xl font-semibold text-zinc-950 [font-family:'Archivo_Black',sans-serif]">
        {countdownSec !== null ? `${countdownSec}s` : "--"}
      </p>
      <div className="absolute bottom-0 left-0 right-0 mx-auto flex max-w-3xl items-center justify-between border-t border-white/60 bg-white/80 px-6 py-4 pb-[env(safe-area-inset-bottom)] text-sm text-zinc-700 backdrop-blur">
        <span>Players connected</span>
        <span className="text-lg font-semibold text-zinc-900">
          {playerCount}
        </span>
      </div>
    </div>
  );
}
