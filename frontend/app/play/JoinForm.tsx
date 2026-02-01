"use client";

import EmojiPicker, {EmojiClickData} from "emoji-picker-react";

type JoinFormProps = {
  roomCode: string;
  name: string;
  emoji: string;
  status: string;
  error: string | null;
  showPicker: boolean;
  onRoomCodeChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onEmojiChange: (value: string) => void;
  onTogglePicker: () => void;
  onJoin: () => void;
};

export default function JoinForm({
  roomCode,
  name,
  emoji,
  status,
  error,
  showPicker,
  onRoomCodeChange,
  onNameChange,
  onEmojiChange,
  onTogglePicker,
  onJoin,
}: JoinFormProps) {
  return (
    <>
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Room Code
          <input
            value={roomCode}
            onChange={(event) => onRoomCodeChange(event.target.value)}
            placeholder="ABCD"
            className="rounded-2xl border border-zinc-900/10 bg-white/80 px-4 py-4 text-xl uppercase tracking-[0.2em] text-zinc-950 outline-none focus:border-zinc-900/40"
          />
        </label>
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

      <div className="mt-8">
        <p className="text-sm font-medium text-zinc-700">Pick any Emoji</p>
        <div className="mt-3 flex flex-col gap-4">
          <button
            type="button"
            onClick={onTogglePicker}
            className="flex items-center justify-between rounded-2xl border border-zinc-900/10 bg-white/80 px-4 py-4 text-left text-lg text-zinc-900"
          >
            <span>{emoji || "Choose an emoji"}</span>
            <span className="text-2xl">{emoji || "😀"}</span>
          </button>
          {showPicker ? (
            <div className="overflow-hidden rounded-2xl border border-zinc-900/10 bg-white/80">
              <EmojiPicker
                onEmojiClick={(data: EmojiClickData) => {
                  onEmojiChange(data.emoji);
                }}
                height={360}
                width="100%"
                searchDisabled={false}
                skinTonesDisabled={false}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onJoin}
          className="inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-6 py-4 text-sm uppercase tracking-[0.2em] text-white transition hover:translate-y-[-1px] hover:bg-zinc-900 sm:w-auto"
        >
          Join Room
        </button>
        <div className="text-sm text-zinc-600">
          Status: <span className="font-medium text-zinc-900">{status}</span>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </>
  );
}
