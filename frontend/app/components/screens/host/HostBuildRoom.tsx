import {useEffect} from "react";

export default function HostBuildRoom({
  onReady,
  countdownSec,
}: {
  onReady?: () => void,
  countdownSec: number | null,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div className="relative min-h-screen text-zinc-900 aling-items-center content-center">
      <div className="absolute inset-0 -z-10">
        <div className="animated-squares-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_0%,_rgba(0,0,0,0.45)_60%,_rgba(0,0,0,0.75)_100%)]" />
      </div>
      <div className="mt-80 place-items-center mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12 text-white sm:px-10 sm:py-16">
        <div className="mt-16 flex w-full flex-col items-center text-center">
          <p className="mt-6 text-4xl font-semibold uppercase tracking-[0.2em] text-white sm:text-6xl">
            Build your faces!
          </p>
          <p className="mt-8 text-6xl font-semibold text-white sm:text-4xl">
            {countdownSec !== null ? `${countdownSec} seconds left` : "--"}
          </p>
        </div>
      </div>
    </div>
  )
}
