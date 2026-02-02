import {useEffect, useState} from "react";
import RoomSettingsForm, {
  DEFAULT_ROOM_SETTINGS,
} from "@/app/components/RoomSettingsForm";
import Button from "@/app/components/Button";
import PlayerStageShell from "@/app/components/screens/player/PlayerStageShell";

export default function PlayerCreateRoom({
  onReady,
  onCreate,
  isCreating,
  onBack,
}: {
  onReady?: () => void,
  onCreate: (settings: typeof DEFAULT_ROOM_SETTINGS) => void,
  isCreating?: boolean,
  onBack?: () => void,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const [settings, setSettings] = useState(DEFAULT_ROOM_SETTINGS);

  return (
    <div className="relative min-h-screen text-white aling-items-center content-center">
      <div className="absolute left-6 top-16 z-10">
        <Button
          variant="plain"
          onClick={onBack}
          className="text-white text-sm uppercase tracking-[0.2em]"
        >
          Back
        </Button>
      </div>
      <div className="absolute inset-0 -z-10">
        <div className="pattern-arches-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 vignette-strong" />
      </div>
      <PlayerStageShell>
        <div className="flex h-full w-full flex-col items-center justify-center px-6 text-white sm:px-10">
          <img
            src="/logo.png"
            alt="Luchadores Arena"
            data-home-logo
            className="w-[260px] max-w-[40vw] object-contain cursor-pointer"
          />
          <div className="w-full scale-[0.7]">
            <RoomSettingsForm settings={settings} onChange={setSettings} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={() => onCreate(settings)}
              className="h-10 min-w-[240px] px-6 text-lg tracking-[0.18em] scale-[0.6]"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </div>
      </PlayerStageShell>
    </div>
  );
}
