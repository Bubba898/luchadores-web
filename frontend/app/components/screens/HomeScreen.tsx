"use client";

import {useEffect, useMemo, useState} from "react";
import Button from "@/app/components/Button";
import {ScreenState} from "@/app/components/screens/screenState";

export default function HomeScreen({
  setScreen,
  onReady
}: {
  setScreen: (screen: ScreenState) => Promise<void>,
  onReady?: () => void
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const patternOptions = useMemo(
    () => [
      {label: "Chevron", className: "pattern-chevron-bg"},
      {label: "Orbit", className: "pattern-orbit-bg"},
      {label: "Fan", className: "pattern-fan-bg"},
      {label: "Rings", className: "pattern-rings-bg"},
      {label: "Arches", className: "pattern-arches-bg"},
      {label: "Tiles", className: "pattern-tiles-bg"},
    ],
    [],
  );
  const [patternIndex, setPatternIndex] = useState(0);
  const currentPattern = patternOptions[patternIndex % patternOptions.length];

  return (
    <>
      <div className="absolute inset-0 -z-10">
        <div className={`${currentPattern.className} h-full w-full`} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.0)_0%,_rgba(0,0,0,0.3)_50%,_rgba(0,0,0,0.6)_100%)]" />
      </div>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Space+Grotesk:wght@400;500;600&display=swap");
      `}</style>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12 sm:px-10 sm:py-16">
        <header className="flex flex-col items-center gap-6">
          <img
            src="/logo.png"
            alt="Luchadores Arena"
            className="w-[1080px] max-w-[70vw] object-contain"
          />
        </header>

        <main className="mt-10 flex w-full items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-6">
            <Button onClick={() => setScreen("playerCreate")} className="min-w-[360px]">
              Create Room
            </Button>
            <Button onClick={() => setScreen("playerJoin")} className="min-w-[360px]">
              Join Room
            </Button>
            <Button onClick={() => setScreen("hostRoom")} className="min-w-[360px]">
              Host Room
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setPatternIndex((prev) => (prev + 1) % patternOptions.length);
              }}
              className="min-w-[360px]"
            >
              Pattern: {currentPattern.label}
            </Button>
            <span className="text-white text-xl w-200 text-center" style={{
              textShadow:
                "-1px -1px 0 rgba(0,0,0,0.6), 1px -1px 0 rgba(0,0,0,0.6), -1px 1px 0 rgba(0,0,0,0.6), 1px 1px 0 rgba(0,0,0,0.6)",
            }}>
              Hosting a Room is for hosting a room on a big tv screen and then have everyone join from their phone.
            </span>
          </div>
        </main>
      </div>
    </>
  )}
