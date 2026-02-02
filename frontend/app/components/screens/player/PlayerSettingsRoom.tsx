import {useEffect} from "react";
import Button from "@/app/components/Button";
import PlayerStageShell from "@/app/components/screens/player/PlayerStageShell";

export default function PlayerSettingsRoom({
  onReady,
  roomCode,
  showRoomCode = false,
  name,
  emoji,
  status,
  error,
  onRoomCodeChange,
  onNameChange,
  onEmojiChange,
  onJoin,
}: {
  onReady?: () => void,
  roomCode?: string,
  showRoomCode?: boolean,
  name: string,
  emoji: string,
  status: string,
  error: string | null,
  onRoomCodeChange?: (value: string) => void,
  onNameChange: (value: string) => void,
  onEmojiChange: (value: string) => void,
  onJoin: () => void,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const limitToSingleGrapheme = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      const segmenter = new Intl.Segmenter(undefined, {granularity: "grapheme"});
      const first = segmenter.segment(trimmed)[Symbol.iterator]().next();
      return first.done ? "" : first.value.segment;
    }
    return Array.from(trimmed)[0] ?? "";
  };

  return (
    <div className="relative min-h-screen text-white aling-items-center content-center">
      <div className="absolute inset-0 -z-10">
        <div className="host-eye-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_rgba(0,0,0,0.55)_100%)]" />
      </div>
      <PlayerStageShell>
        <div className="flex h-full w-full flex-col items-center justify-center px-6 text-white sm:px-10">
          <img
            src="/logo.png"
            alt="Luchadores Arena"
            className="w-[260px] max-w-[40vw] object-contain"
          />
          <div className="mt-10 w-full max-w-2xl">
            {showRoomCode ? (
              <label className="flex flex-col gap-2 text-lg font-medium text-white">
                Room Code
                <input
                  value={roomCode ?? ""}
                  onChange={(event) => onRoomCodeChange?.(event.target.value)}
                  placeholder="ABCD"
                  className="rounded-2xl border border-white/20 bg-white/90 px-4 py-4 text-xl uppercase tracking-[0.2em] text-zinc-950 outline-none focus:border-white/60"
                />
              </label>
            ) : null}

            <label className="mt-6 flex flex-col gap-2 text-lg font-medium text-white">
              Emoji
              <input
                value={emoji}
                onChange={(event) =>
                  onEmojiChange(limitToSingleGrapheme(event.target.value))
                }
                placeholder="😀"
                inputMode="text"
                autoComplete="off"
                className="rounded-2xl border border-white/20 bg-white/90 px-4 py-4 text-2xl text-zinc-950 outline-none focus:border-white/60"
              />
            </label>
            <label className="mt-6 flex flex-col gap-2 text-lg font-medium text-white">
              Name
              <input
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Your name"
                className="rounded-2xl border border-white/20 bg-white/90 px-4 py-4 text-xl text-zinc-950 outline-none focus:border-white/60"
              />
            </label>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Button onClick={onJoin} className="min-w-[220px] scale-[0.6]">
                Join Room
              </Button>
            </div>
            {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
          </div>
        </div>
      </PlayerStageShell>
    </div>
  );
}
