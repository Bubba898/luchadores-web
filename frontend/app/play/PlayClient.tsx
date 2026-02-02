"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import type {CSSProperties} from "react";
import {useSearchParams} from "next/navigation";
import JoinForm from "./JoinForm";
import WaitingRoom from "./WaitingRoom";
import PreviewScreen from "./PreviewScreen";
import BuildScreen from "./BuildScreen";
import VoteScreen from "./VoteScreen";
import ResultsScreen from "./ResultsScreen";
import BackendHealthBadge from "../components/BackendHealthBadge";

const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? "ws://localhost:3001";

export default function PlayClient() {
  const stageWidth = 390;
  const stageHeight = (stageWidth * 16) / 9;
  const searchParams = useSearchParams();
  const prefillCode = useMemo(
    () => searchParams.get("code") ?? "",
    [searchParams],
  );
  const [roomCode, setRoomCode] = useState(prefillCode);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState<string>("");
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState<string | null>(null);
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
  const socketRef = useRef<WebSocket | null>(null);
  const hostOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const [stageScale, setStageScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const nextScale = Math.min(
        window.innerWidth / stageWidth,
        window.innerHeight / stageHeight,
      );
      setStageScale(Number.isFinite(nextScale) ? nextScale : 1);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [stageHeight, stageWidth]);

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

  const joinRoom = () => {
    setError(null);
    if (!roomCode.trim() || !name.trim() || !emoji) {
      setError("Please enter room code, name, and pick an emoji.");
      return;
    }
    setStatus("Connecting...");
    const emojiCode = emoji.codePointAt(0);
    const query = new URLSearchParams({
      code: roomCode.trim().toUpperCase(),
      name: name.trim(),
      emoji: emojiCode ? String(emojiCode) : "",
    });
    const socket = new WebSocket(`${WS_BASE}/player?${query.toString()}`);
    socketRef.current = socket;
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

  return (
    <div className="h-[100dvh] overflow-hidden bg-[repeating-linear-gradient(135deg,_#0f0f12_0px,_#0f0f12_18px,_#151519_18px,_#151519_36px)] text-zinc-900">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Archivo+Black&family=Instrument+Sans:wght@400;500;600&display=swap");
        .stage-shell {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .stage-9x16 {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: var(--stage-width);
          height: var(--stage-height);
          transform: translateX(-50%) scale(var(--stage-scale));
          transform-origin: bottom center;
        }
      `}</style>
      <div className="flex h-[100dvh] w-full flex-col items-center justify-end">
        <div
          className="stage-shell"
          style={{
            width: `${stageWidth * stageScale}px`,
            height: `${stageHeight * stageScale}px`,
          }}
        >
          <div
            className="stage-9x16 w-full overflow-hidden bg-[radial-gradient(circle_at_top,_#e2f6ff_0%,_#b9e6ff_35%,_#7bc1ff_70%,_#3c7bd7_100%)] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)]"
            style={
              {
                "--stage-width": `${stageWidth}px`,
                "--stage-height": `${stageHeight}px`,
                "--stage-scale": stageScale,
              } as CSSProperties
            }
          >
            <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-5 py-10">
            <header className="flex flex-col gap-3" />

            <main
              className={
                status === "Connected"
                  ? "mt-8 flex-1"
                  : "mt-8 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.4)] backdrop-blur"
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
                    stageScale={stageScale}
                    onPartDrop={(partId, xPercent, yPercent) => {
                      socketRef.current?.send(
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
                      socketRef.current?.send(
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
                  <WaitingRoom
                    countdownSec={countdownSec}
                    playerCount={playerCount}
                    roomCode={roomCode.trim() ? roomCode.toUpperCase() : null}
                    joinUrl={
                      roomCode.trim() && hostOrigin
                        ? `${hostOrigin}/play?code=${roomCode
                            .trim()
                            .toUpperCase()}`
                        : null
                    }
                  />
                )
              ) : (
                <JoinForm
                  roomCode={roomCode}
                  name={name}
                  emoji={emoji}
                  status={status}
                  error={error}
                  onRoomCodeChange={setRoomCode}
                  onNameChange={setName}
                  onEmojiChange={setEmoji}
                  onJoin={joinRoom}
                />
              )}
            </main>
            </div>
          </div>
        </div>
      </div>
      <BackendHealthBadge />
    </div>
  );
}
