"use client";

import Link from "next/link";
import BackendHealthBadge from "./components/BackendHealthBadge";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8e8_0%,_#fdd5b7_32%,_#f4a66c_68%,_#d86a3a_100%)] text-zinc-900">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Space+Grotesk:wght@400;500;600&display=swap");
      `}</style>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12 sm:px-10 sm:py-16">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-800/70">
            Luchadores Arena
          </p>
          <h1 className="text-4xl text-zinc-950 [font-family:'Fraunces',serif] sm:text-5xl">
            Pick your entrance and set the rules.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-900/80 [font-family:'Space_Grotesk',sans-serif]">
            Join a match, host the big screen, or create a room and jump in as a
            player. Adjust timings and part limits before you launch.
          </p>
        </header>

        <main className="mt-10 grid gap-6">
          <section className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
            <h2 className="text-xl font-semibold [font-family:'Fraunces',serif]">
              Choose a path
            </h2>
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-zinc-900/10 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  Join a room
                </p>
                <p className="mt-2 text-lg font-medium text-zinc-950">
                  Jump into an existing match as a player.
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  You will enter the room code, your name, and an emoji.
                </p>
                <Link
                  href="/play"
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-zinc-900/20 px-5 py-2 text-sm uppercase tracking-[0.2em] text-zinc-900 transition hover:-translate-y-0.5 hover:border-zinc-900/40"
                >
                  Join Room
                </Link>
              </div>

              <div className="rounded-2xl border border-zinc-900/10 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  Host a room
                </p>
                <p className="mt-2 text-lg font-medium text-zinc-950">
                  Launch a big-screen host view with the current host flow.
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  Create the room and manage the phases on a large display.
                </p>
                <Link
                  href="/host"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2 text-sm uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:bg-zinc-900"
                >
                  Host Room
                </Link>
              </div>

              <div className="rounded-2xl border border-zinc-900/10 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  Create and play
                </p>
                <p className="mt-2 text-lg font-medium text-zinc-950">
                  Create a room and join as a player immediately.
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  Use one screen to host and play with a single launch.
                </p>
                <Link
                  href="/hostplay"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2 text-sm uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:bg-zinc-900"
                >
                  Create & Join
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
      <BackendHealthBadge />
    </div>
  );
}
