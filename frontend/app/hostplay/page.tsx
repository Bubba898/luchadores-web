"use client";

import {treaty} from "@elysiajs/eden";
import {useEffect, useRef, useState} from "react";
import type {App} from "../../../backend/src";
import BuildScreen from "../play/BuildScreen";
import JoinForm from "../play/JoinForm";
import PreviewScreen from "../play/PreviewScreen";
import ResultsScreen from "../play/ResultsScreen";
import VoteScreen from "../play/VoteScreen";
import WaitingRoom from "../play/WaitingRoom";
import BackendHealthBadge from "../components/BackendHealthBadge";
import RoomSettingsForm, {
  DEFAULT_ROOM_SETTINGS,
} from "../components/RoomSettingsForm";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";
const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? "ws://localhost:3001";
//@ts-ignore
const api = treaty<App>(API_BASE);

export default function HostPlayPage() {
  const [settings, setSettings] = useState(DEFAULT_ROOM_SETTINGS);
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState<string>("");
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [phase, setPhase] = useState<string | null>(null);
  const [mask, setMask] = useState<string | null>(null);
  const [partLimit, setPartLimit] = useState<number | null>(null);
  const [voteEntries, setVoteEntries] = useState<
    {
      playerId: number;
      name: string;
      emoji: number | null;
      placements: {id: string; x: number; y: number}[];
    }[]
  >([]);
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
  const [likedTargets, setLikedTargets] = useState<Record<number, boolean>>({});
  const [resultsWinner, setResultsWinner] = useState<{
    playerId: number;
    name: string;
    emoji: number | null;
    placements: {id: string; x: number; y: number}[];
  } | null>(null);
  const hostSocketRef = useRef<WebSocket | null>(null);
  const playerSocketRef = useRef<WebSocket | null>(null);
  const hostOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    if (countdownSec === null) {
      return;
    }
    if (countdownSec <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setCountdownSec((value) => (value ? Math.max(value - 1, 0) : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdownSec]);

  useEffect(() => {
    return () => {
      hostSocketRef.current?.close();
      playerSocketRef.current?.close();
    };
  }, []);

  const connectHostSocket = (code: string) => {
    hostSocketRef.current?.close();
    const socket = new WebSocket(`${WS_BASE}/host?code=${code}`);
    hostSocketRef.current = socket;
    socket.addEventListener("error", () => {
      setError("Host socket error");
    });
  };

  const connectPlayerSocket = (code: string) => {
    const emojiCode = emoji.codePointAt(0);
    const query = new URLSearchParams({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      emoji: emojiCode ? String(emojiCode) : "",
    });
    const socket = new WebSocket(`${WS_BASE}/player?${query.toString()}`);
    playerSocketRef.current = socket;
    socket.addEventListener("open", () => setStatus("Connected"));
    socket.addEventListener("close", () => setStatus("Disconnected"));
    socket.addEventListener("error", () => setError("Socket error"));
    socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(String(event.data));
        if (message?.messageType === "playercount") {
          setPlayerCount(Number(message.count) || 0);
        }
        if (message?.messageType === "phasechange") {
          setPhase(typeof message.phase === "string" ? message.phase : null);
          setCountdownSec(
            typeof message.countdownSec === "number"
              ? message.countdownSec
              : null,
          );
        }
        if (message?.messageType === "maskselected") {
          setMask(typeof message.mask === "string" ? message.mask : null);
        }
        if (message?.messageType === "partlimit") {
          setPartLimit(
            typeof message.limit === "number" ? message.limit : null,
          );
        }
        if (message?.messageType === "votegallery") {
          setVoteEntries(Array.isArray(message.entries) ? message.entries : []);
          setLikedTargets({});
          if (typeof message.mask === "string") {
            setMask(message.mask);
          }
        }
        if (message?.messageType === "voteupdate") {
          if (typeof message.targetPlayerId === "number") {
            setVoteCounts((prev) => ({
              ...prev,
              [message.targetPlayerId]: Number(message.count) || 0,
            }));
          }
        }
        if (message?.messageType === "results") {
          if (message.winner) {
            setResultsWinner(message.winner);
          }
          if (typeof message.mask === "string") {
            setMask(message.mask);
          }
        }
      } catch {
        // Ignore non-JSON messages.
      }
    });
  };

  const createAndJoin = async () => {
    setError(null);
    if (!name.trim() || !emoji) {
      setError("Please enter name and pick an emoji.");
      return;
    }
    setStatus("Creating room...");
    try {
      const {data, error} = await api.rooms.post(settings);
      if (error || !data) {
        throw new Error("Create room failed");
      }
      setRoomCode(data.code);
      connectHostSocket(data.code);
      setStatus("Connecting...");
      connectPlayerSocket(data.code);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus("Idle");
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,_#e2f6ff_0%,_#b9e6ff_35%,_#7bc1ff_70%,_#3c7bd7_100%)] text-zinc-900">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Space+Grotesk:wght@400;500;600&display=swap");
      `}</style>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-10 sm:px-8 sm:py-14">
        <main
          className={
            status === "Connected"
              ? "flex-1"
              : "flex flex-col gap-6"
          }
        >
          {status === "Connected" ? (
            phase === "preview" ? (
              <PreviewScreen
                mask={mask}
                countdownSec={countdownSec}
                playerCount={playerCount}
              />
            ) : phase === "build" ? (
              <BuildScreen
                mask={mask}
                partLimit={partLimit}
                countdownSec={countdownSec}
                onPartDrop={(partId, xPercent, yPercent) => {
                  playerSocketRef.current?.send(
                    JSON.stringify({
                      messageType: "partdrop",
                      id: partId,
                      x: xPercent,
                      y: yPercent,
                    }),
                  );
                }}
              />
            ) : phase === "vote" ? (
              <VoteScreen
                mask={mask}
                entries={voteEntries}
                counts={voteCounts}
                likedTargets={likedTargets}
                countdownSec={countdownSec}
                onVote={(targetPlayerId) => {
                  if (likedTargets[targetPlayerId]) {
                    return;
                  }
                  setLikedTargets((prev) => ({
                    ...prev,
                    [targetPlayerId]: true,
                  }));
                  setVoteCounts((prev) => ({
                    ...prev,
                    [targetPlayerId]: (prev[targetPlayerId] ?? 0) + 1,
                  }));
                  playerSocketRef.current?.send(
                    JSON.stringify({
                      messageType: "vote",
                      targetPlayerId,
                    }),
                  );
                }}
              />
            ) : phase === "results" ? (
              <ResultsScreen mask={mask} winner={resultsWinner} />
            ) : (
              <div className="flex h-full flex-col">
                <WaitingRoom
                  countdownSec={countdownSec}
                  playerCount={playerCount}
                  roomCode={roomCode || null}
                  joinUrl={
                    roomCode && hostOrigin
                      ? `${hostOrigin}/play?code=${roomCode}`
                      : null
                  }
                />
                <div className="fixed bottom-20 left-0 right-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      hostSocketRef.current?.send(
                        JSON.stringify({messageType: "start"}),
                      )
                    }
                    disabled={phase !== "join"}
                    className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/80 px-6 py-3 text-xs uppercase tracking-[0.2em] text-zinc-800 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5 hover:border-white disabled:cursor-not-allowed disabled:border-white/40"
                  >
                    Start Match
                  </button>
                </div>
              </div>
            )
          ) : (
            <>
              <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.4)] backdrop-blur sm:p-8">
                <h2 className="text-xl font-semibold [font-family:'Fraunces',serif]">
                  Room settings
                </h2>
                <p className="mt-2 text-sm text-zinc-600">
                  Configure the round timers and build limits.
                </p>
                <div className="mt-6">
                  <RoomSettingsForm
                    settings={settings}
                    onChange={setSettings}
                    disabled={status !== "Idle"}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(DEFAULT_ROOM_SETTINGS)}
                  disabled={status !== "Idle"}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-zinc-900/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-700 transition hover:-translate-y-0.5 hover:border-zinc-900/40 disabled:cursor-not-allowed disabled:border-zinc-900/10"
                >
                  Reset settings
                </button>
              </section>

              <section className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.4)] backdrop-blur sm:p-8">
                <h2 className="text-xl font-semibold [font-family:'Fraunces',serif]">
                  Player setup
                </h2>
                <p className="mt-2 text-sm text-zinc-600">
                  Add your player details. Room code will be generated for you.
                </p>
                <div className="mt-6">
                  <JoinForm
                    roomCode={roomCode}
                    name={name}
                    emoji={emoji}
                    status={status}
                    error={error}
                    showPicker={showPicker}
                    showRoomCode={false}
                    joinLabel="Create & Join"
                    onRoomCodeChange={() => {}}
                    onNameChange={setName}
                    onEmojiChange={(value) => {
                      setEmoji(value);
                      setShowPicker(false);
                    }}
                    onTogglePicker={() => setShowPicker((value) => !value)}
                    onJoin={createAndJoin}
                  />
                </div>
                {roomCode ? (
                  <div className="mt-6 rounded-2xl border border-zinc-900/10 bg-white/80 px-4 py-3 text-xs text-zinc-700">
                    Room Code:{" "}
                    <span className="font-semibold text-zinc-900">
                      {roomCode}
                    </span>
                  </div>
                ) : null}
              </section>
            </>
          )}
        </main>
      </div>
      <BackendHealthBadge />
    </div>
  );
}
