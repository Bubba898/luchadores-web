"use client";

import {useEffect} from "react";
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

  return (
    <>
      <div className="absolute inset-0 -z-10">
        <div className="host-eye-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.0)_0%,_rgba(0,0,0,0.3)_50%,_rgba(0,0,0,0.6)_100%)]" />
      </div>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Space+Grotesk:wght@400;500;600&display=swap");
      `}</style>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12 sm:px-10 sm:py-16">
        <div className="absolute right-4 top-16 z-10 flex flex-col items-end gap-3 text-white">
          <a
            href="https://github.com/Bubba898/luchadores-web"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white/90 hover:text-white"
            aria-label="GitHub"
            title="GitHub"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5 fill-current"
            >
              <path d="M12 0.5C5.73 0.5 0.75 5.48 0.75 11.75c0 4.99 3.24 9.21 7.73 10.7.56.1.77-.24.77-.55v-2.08c-3.15.68-3.82-1.34-3.82-1.34-.52-1.33-1.27-1.68-1.27-1.68-1.04-.7.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.74 2.67 1.24 3.33.95.1-.74.4-1.24.72-1.53-2.52-.29-5.18-1.26-5.18-5.6 0-1.23.44-2.24 1.17-3.02-.12-.29-.51-1.45.11-3.02 0 0 .95-.31 3.1 1.15.9-.25 1.86-.38 2.82-.38.96 0 1.93.13 2.82.38 2.15-1.46 3.1-1.15 3.1-1.15.62 1.57.23 2.73.11 3.02.73.78 1.17 1.79 1.17 3.02 0 4.35-2.67 5.31-5.2 5.59.41.35.77 1.05.77 2.12v3.14c0 .31.2.66.78.55 4.48-1.5 7.72-5.72 7.72-10.7C23.25 5.48 18.27.5 12 .5z" />
            </svg>
          </a>
          <a
            href="https://mcaetano15.itch.io/los-luchadores"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90 hover:text-white"
          >
            Single Player
          </a>
        </div>
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
            <span className="text-white text-xl w-200 text-center" style={{
              textShadow:
                "-1px -1px 0 rgba(0,0,0,0.6), 1px -1px 0 rgba(0,0,0,0.6), -1px 1px 0 rgba(0,0,0,0.6), 1px 1px 0 rgba(0,0,0,0.6)",
            }}>
              Hosting a Room is for hosting a room on a big tv screen and then have everyone join from their phone in party mode.
            </span>
          </div>
        </main>
      </div>
    </>
  )}
