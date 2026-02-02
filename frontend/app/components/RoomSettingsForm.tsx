type RoomSettings = {
  previewTimeSec: number;
  buildTimeSec: number;
  voteTimeSec: number;
  partsPerPlayer: number;
  showMaskOnVote: boolean;
};

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  previewTimeSec: 10,
  buildTimeSec: 45,
  voteTimeSec: 20,
  partsPerPlayer: 8,
  showMaskOnVote: false,
};

type RoomSettingsFormProps = {
  settings: RoomSettings;
  disabled?: boolean;
  onChange: (next: RoomSettings) => void;
};

const clamp = (value: number, min: number) =>
  Number.isFinite(value) ? Math.max(value, min) : min;

export default function RoomSettingsForm({
  settings,
  disabled = false,
  onChange,
}: RoomSettingsFormProps) {
  return (
    <div className="grid grid-cols-2 gap-4 text-white">
      <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.08em] whitespace-nowrap">
        Preview time (seconds)
        <input
          type="number"
          min={1}
          value={settings.previewTimeSec}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...settings,
              previewTimeSec: clamp(Number(event.target.value), 1),
            })
          }
          className="rounded-2xl border border-zinc-900/10 bg-white/80 px-4 py-3 text-base text-zinc-950 outline-none focus:border-zinc-900/40 disabled:cursor-not-allowed disabled:bg-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.08em] whitespace-nowrap">
        Build time (seconds)
        <input
          type="number"
          min={1}
          value={settings.buildTimeSec}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...settings,
              buildTimeSec: clamp(Number(event.target.value), 1),
            })
          }
          className="rounded-2xl border border-zinc-900/10 bg-white/80 px-4 py-3 text-base text-zinc-950 outline-none focus:border-zinc-900/40 disabled:cursor-not-allowed disabled:bg-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.08em] whitespace-nowrap">
        Vote time (seconds)
        <input
          type="number"
          min={1}
          value={settings.voteTimeSec}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...settings,
              voteTimeSec: clamp(Number(event.target.value), 1),
            })
          }
          className="rounded-2xl border border-zinc-900/10 bg-white/80 px-4 py-3 text-base text-zinc-950 outline-none focus:border-zinc-900/40 disabled:cursor-not-allowed disabled:bg-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.08em] whitespace-nowrap">
        Parts per player
        <input
          type="number"
          min={1}
          value={settings.partsPerPlayer}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...settings,
              partsPerPlayer: clamp(Number(event.target.value), 1),
            })
          }
          className="rounded-2xl border border-zinc-900/10 bg-white/80 px-4 py-3 text-base text-zinc-950 outline-none focus:border-zinc-900/40 disabled:cursor-not-allowed disabled:bg-zinc-100"
        />
      </label>
      <label className="col-span-2 flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.08em]">
        <input
          type="checkbox"
          checked={settings.showMaskOnVote}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...settings,
              showMaskOnVote: event.target.checked,
            })
          }
          className="h-5 w-5 accent-black bg-white border border-white/60"
        />
        Show masks during vote
      </label>
    </div>
  );
}
