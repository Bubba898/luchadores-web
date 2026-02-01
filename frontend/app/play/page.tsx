"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useSearchParams} from "next/navigation";
import JoinForm from "./JoinForm";
import WaitingRoom from "./WaitingRoom";
import PreviewScreen from "./PreviewScreen";
import BuildScreen from "./BuildScreen";
import VoteScreen from "./VoteScreen";

const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? "ws://localhost:3001";
export default function PlayPage() {
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
  const socketRef = useRef<WebSocket | null>(null);

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
          if (typeof message.countdownSec === "number") {
            setCountdownSec(message.countdownSec);
          }
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
      } catch {
        // Ignore non-JSON messages.
      }
    });
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,_#e2f6ff_0%,_#b9e6ff_35%,_#7bc1ff_70%,_#3c7bd7_100%)] text-zinc-900">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Archivo+Black&family=Instrument+Sans:wght@400;500;600&display=swap");
      `}</style>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-12 sm:px-8 sm:py-16">
        <header className="flex flex-col gap-3" />

        <main
          className={
            status === "Connected"
              ? "mt-10 flex-1"
              : "mt-10 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.4)] backdrop-blur sm:p-8"
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
                onVote={(targetPlayerId) => {
                  socketRef.current?.send(
                    JSON.stringify({
                      messageType: "vote",
                      targetPlayerId,
                    }),
                  );
                }}
              />
            ) : (
              <WaitingRoom
                countdownSec={countdownSec}
                playerCount={playerCount}
              />
            )
          ) : (
            <JoinForm
              roomCode={roomCode}
              name={name}
              emoji={emoji}
              status={status}
              error={error}
              showPicker={showPicker}
              onRoomCodeChange={setRoomCode}
              onNameChange={setName}
              onEmojiChange={(value) => {
                setEmoji(value);
                setShowPicker(false);
              }}
              onTogglePicker={() => setShowPicker((value) => !value)}
              onJoin={joinRoom}
            />
          )}
        </main>
      </div>
    </div>
  );
}
