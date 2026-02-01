"use client";

import {treaty} from "@elysiajs/eden";
import {useEffect, useRef, useState} from "react";
import type {App} from "../../../backend/src/index";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";
const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? "ws://localhost:3001";
const api = treaty<App>(API_BASE);

export default function HostPage() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  const createAndConnect = async () => {
    setError(null);
    setStatus("Creating room...");
    try {
      const {data, error} = await api.rooms.post({});
      if (error || !data) {
        throw new Error("Create room failed");
      }

      setRoomCode(data.code);
      setStatus("Connecting host socket...");

      const socket = new WebSocket(`${WS_BASE}/host?code=${data.code}`);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        setStatus("Host connected");
      });
      socket.addEventListener("close", () => {
        setStatus("Host disconnected");
      });
      socket.addEventListener("error", () => {
        setError("Host socket error");
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus("Idle");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff6db_0%,_#f8d2a5_35%,_#f2a66a_70%,_#d76b3e_100%)] text-zinc-900">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Archivo+Black&family=Instrument+Sans:wght@400;500;600&display=swap");
      `}</style>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16">
        <header className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-800/70">
            Luchadores Host
          </p>
          <h1 className="text-5xl font-semibold text-zinc-950 [font-family:'Archivo_Black',sans-serif] sm:text-6xl">
            Create a room. Rally the crowd.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-900/80 [font-family:'Instrument_Sans',sans-serif]">
            Spin up a fresh room and connect your host socket in a single tap.
            Share the room code with players to start the match.
          </p>
        </header>

        <main className="mt-12 grid gap-6 sm:grid-cols-[2fr_1fr]">
          <section className="rounded-3xl border border-white/50 bg-white/70 p-8 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.4)] backdrop-blur">
            <h2 className="text-xl font-semibold [font-family:'Archivo_Black',sans-serif]">
              Room Control
            </h2>
            <p className="mt-2 text-sm text-zinc-700 [font-family:'Instrument_Sans',sans-serif]">
              Press the button to create a room with default settings and
              connect to the host websocket.
            </p>
            <button
              type="button"
              onClick={createAndConnect}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-zinc-950 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:translate-y-[-1px] hover:bg-zinc-900"
            >
              Create & Connect
            </button>

            <div className="mt-8 rounded-2xl border border-zinc-900/10 bg-white/80 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Status
              </p>
              <p className="mt-2 text-lg font-medium">{status}</p>
              {error ? (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              ) : null}
            </div>
          </section>

          <aside className="rounded-3xl border border-white/50 bg-white/60 p-6 text-zinc-900 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.4)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
              Room Code
            </p>
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-900/20 bg-white/70 px-5 py-6 text-center">
              <p className="text-4xl font-semibold tracking-[0.2em] [font-family:'Archivo_Black',sans-serif]">
                {roomCode ?? "----"}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Share with players to join.
              </p>
            </div>
            <div className="mt-6 space-y-3 text-sm text-zinc-700 [font-family:'Instrument_Sans',sans-serif]">
              <p>Host socket listens on `/host`.</p>
              <p>Room expires 30 minutes after creation.</p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
