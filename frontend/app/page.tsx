"use client";

import BackendHealthBadge from "./components/BackendHealthBadge";
import Button from "./components/Button";

export default function Home() {
  return (
    <div className="relative min-h-screen text-zinc-900">
      <div className="absolute inset-0 -z-10">
        <div className="host-eye-bg h-full w-full" />
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
            className="mx-auto w-full max-w-4xl object-contain"
          />
        </header>

        <main className="mt-10 flex w-full items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-6">
            <Button href="/hostplay" className="min-w-[360px]">
              Create Room
            </Button>
            <Button href="/play" className="min-w-[360px]">
              Join Room
            </Button>
            <Button href="/host" className="min-w-[360px]">
              Host Room
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
      <BackendHealthBadge />
    </div>
  );
}
