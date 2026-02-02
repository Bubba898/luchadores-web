"use client";

import {treaty} from "@elysiajs/eden";
import {useEffect, useRef, useState} from "react";
import type {CSSProperties} from "react";
import type {App} from "../../../backend/src";
import BuildScreen from "../play/BuildScreen";
import JoinForm from "../play/JoinForm";
import PreviewScreen from "../play/PreviewScreen";
import ResultsScreen from "../play/ResultsScreen";
import VoteScreen from "../play/VoteScreen";
import WaitingRoom from "../play/WaitingRoom";
import BackendHealthBadge from "../components/BackendHealthBadge";
import Button from "../components/Button";
import RoomSettingsForm, {
  DEFAULT_ROOM_SETTINGS,
} from "../components/RoomSettingsForm";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";
const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? "ws://localhost:3001";
//@ts-ignore
const api = treaty<App>(API_BASE);

export default function HostPlayPage() {
  const stageWidth = 390;
  const stageHeight = (stageWidth * 16) / 9;
  const [settings, setSettings] = useState(DEFAULT_ROOM_SETTINGS);
  const [setupStep, setSetupStep] = useState<"settings" | "player">(
    "settings",
  );
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
  const [stageScale, setStageScale] = useState(1);

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

  const createRoom = async () => {
    setError(null);
    setStatus("Creating room...");
    try {
      const {data, error} = await api.rooms.post(settings);
      if (error || !data) {
        throw new Error("Create room failed");
      }
      setRoomCode(data.code);
      connectHostSocket(data.code);
      setStatus("Idle");
      setSetupStep("player");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus("Idle");
    }
  };

  const joinAsPlayer = () => {
    setError(null);
    if (!name.trim() || !emoji) {
      setError("Please enter name and pick an emoji.");
      return;
    }
    if (!roomCode) {
      setError("Room code missing. Create a room first.");
      return;
    }
    setStatus("Connecting...");
    connectPlayerSocket(roomCode);
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[repeating-linear-gradient(135deg,_#0f0f12_0px,_#0f0f12_18px,_#151519_18px,_#151519_36px)] text-zinc-900">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Space+Grotesk:wght@400;500;600&display=swap");
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
            <main
              className={
                status === "Connected"
                  ? "flex h-full flex-col px-5 py-10"
                  : "flex h-full flex-col gap-6 px-5 py-10"
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
              <div className="relative flex h-full flex-col">
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
                <div className="absolute bottom-20 left-0 right-0 flex items-center justify-center">
                  <Button
                    onClick={() =>
                      hostSocketRef.current?.send(
                        JSON.stringify({messageType: "start"}),
                      )
                    }
                    disabled={phase !== "join"}
                    className="min-w-[220px]"
                  >
                    Start Match
                  </Button>
                </div>
              </div>
            )
          ) : setupStep === "settings" ? (
            <>
              <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.4)] backdrop-blur">
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
                <Button
                  onClick={createRoom}
                  disabled={status !== "Idle"}
                  className="mt-6 min-w-[220px]"
                >
                  Create room
                </Button>
              </section>
            </>
          ) : (
            <section className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.4)] backdrop-blur">
              <h2 className="text-xl font-semibold [font-family:'Fraunces',serif]">
                Player setup
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Add your player details to join the room.
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
                  joinLabel="Join Room"
                  onRoomCodeChange={() => {}}
                  onNameChange={setName}
                  onEmojiChange={(value) => {
                    setEmoji(value);
                    setShowPicker(false);
                  }}
                  onTogglePicker={() => setShowPicker((value) => !value)}
                  onJoin={joinAsPlayer}
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
              <Button
                onClick={() => setSetupStep("settings")}
                disabled={status !== "Idle"}
                className="mt-6 min-w-[220px]"
              >
                Back to settings
              </Button>
            </section>
          )}
            </main>
          </div>
        </div>
      </div>
      <BackendHealthBadge />
    </div>
  );
}
