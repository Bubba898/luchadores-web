type RoomSettings = {
  previewTimeSec: number;
  buildTimeSec: number;
  voteTimeSec: number;
  partsPerPlayer: number;
};

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  previewTimeSec: 7,
  buildTimeSec: 20,
  voteTimeSec: 20,
  partsPerPlayer: 5,
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
    <div className="grid gap-4">
      <img
        src="/logo.png"
        alt="Luchadores Arena"
        className="mx-auto w-full max-w-[220px] object-contain"
      />
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
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
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
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
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
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
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
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
    </div>
  );
}
