"use client";

import EmojiPicker, {EmojiClickData} from "emoji-picker-react";
import Button from "../components/Button";

type JoinFormProps = {
  roomCode: string;
  name: string;
  emoji: string;
  status: string;
  error: string | null;
  showPicker: boolean;
  showRoomCode?: boolean;
  joinLabel?: string;
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
  showRoomCode = true,
  joinLabel = "Join Room",
  onRoomCodeChange,
  onNameChange,
  onEmojiChange,
  onTogglePicker,
  onJoin,
}: JoinFormProps) {
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

      <div className="mt-8">
        <p className="text-sm font-medium text-zinc-700">Pick any Emoji</p>
        <div className="mt-3 flex flex-col gap-4">
          <Button
            variant="plain"
            onClick={onTogglePicker}
            className="flex w-full items-center justify-between rounded-2xl border border-zinc-900/10 bg-white/80 px-4 py-4 text-left text-lg text-zinc-900"
          >
            <span>{emoji || "Choose an emoji"}</span>
            <span className="text-2xl">{emoji || "😀"}</span>
          </Button>
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

      <div className="mt-10 flex flex-col items-start gap-4">
        <Button onClick={onJoin} className="w-full">
          {joinLabel}
        </Button>
        <div className="text-sm text-zinc-600">
          Status: <span className="font-medium text-zinc-900">{status}</span>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </>
  );
}
