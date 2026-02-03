import {useEffect, useMemo} from "react";

export default function HostPreviewRoom({
  onReady,
  mask,
  countdownSec,
  layer = "full",
}: {
  onReady?: () => void,
  mask: string | null,
  countdownSec: number | null,
  layer?: "background" | "content" | "full",
}) {
  useEffect(() => {
    if (layer !== "background") {
      onReady?.();
    }
  }, [onReady, layer]);

  const maskSrc = useMemo(() => {
    return mask ? `/masks/${mask}` : null;
  }, [mask]);

  const background = (
    <div className={`absolute inset-0 ${layer === "background" ? "" : "-z-10"}`}>
      <div className="waves-bg h-full w-full" />
      <div className="pointer-events-none absolute inset-0 vignette-strong" />
    </div>
  );

  const content = (
    <div className="relative min-h-screen text-zinc-900 aling-items-center content-center">
      <div className="place-items-center mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12 text-white sm:px-10 sm:py-16">
        <div className="mt-10 flex w-full flex-col items-center text-center">
          <p className="mb-12 text-white text-8xl">
            Remember the mask!
          </p>
          <div className="mt-8 flex h-180 w-200 items-center justify-center">
            {maskSrc ? (
              <img
                src={maskSrc}
                alt="Mask preview"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-white/40 text-sm text-white/70">
                Waiting for mask...
              </div>
            )}
          </div>
          <p className="mt-6 text-6xl font-semibold text-white sm:text-4xl">
            {countdownSec !== null ? `${countdownSec}`  : "--"}
          </p>
        </div>
      </div>
    </div>
  );

  if (layer === "background") {
    return background;
  }
  if (layer === "content") {
    return content;
  }
  return (
    <>
      {background}
      {content}
    </>
  );
}
