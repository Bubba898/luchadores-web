"use client";

import Button from "../../../components/Button";

type JoinFormProps = {
  roomCode: string;
  name: string;
  emoji: string;
  status: string;
  error: string | null;
  showRoomCode?: boolean;
  joinLabel?: string;
  onRoomCodeChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onEmojiChange: (value: string) => void;
  onJoin: () => void;
};

export default function JoinForm({
  roomCode,
  name,
  emoji,
  status,
  error,
  showRoomCode = true,
  joinLabel = "Join Room",
  onRoomCodeChange,
  onNameChange,
  onEmojiChange,
  onJoin,
}: JoinFormProps) {
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
    <>
      <div className="flex justify-center">
        <img
          src="/logo.png"
          alt="Luchadores Arena"
          className="mx-auto w-full max-w-[220px] object-contain"
        />
      </div>
      <div className="flex flex-col gap-5">
        {showRoomCode ? (
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Room Code
            <input
              value={roomCode}
              onChange={(event) => onRoomCodeChange(event.target.value)}
              placeholder="ABCD"
              className="rounded-2xl border border-zinc-900/10 bg-white/80 px-4 py-4 text-xl uppercase tracking-[0.2em] text-zinc-950 outline-none focus:border-zinc-900/40"
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Name
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Your name"
            className="rounded-2xl border border-zinc-900/10 bg-white/80 px-4 py-4 text-xl text-zinc-950 outline-none focus:border-zinc-900/40"
          />
        </label>
      </div>

      <label className="mt-8 flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Emoji
        <input
          value={emoji}
          onChange={(event) =>
            onEmojiChange(limitToSingleGrapheme(event.target.value))
          }
          placeholder="😀"
          inputMode="text"
          autoComplete="off"
          className="rounded-2xl border border-zinc-900/10 bg-white/80 px-4 py-4 text-2xl text-zinc-950 outline-none focus:border-zinc-900/40"
        />
      </label>

      <div className="mt-10 flex flex-col items-start gap-4">
        <Button onClick={onJoin} className="w-full">
          {joinLabel}
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </>
  );
}
