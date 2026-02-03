import {useEffect} from "react";
import PreviewScreen from "./PreviewScreen";
import PlayerStageShell from "@/app/components/screens/player/PlayerStageShell";

export default function PlayerPreviewRoom({
  onReady,
  mask,
  countdownSec,
  playerCount,
  layer = "full",
}: {
  onReady?: () => void,
  mask: string | null,
  countdownSec: number | null,
  playerCount: number,
  layer?: "background" | "content" | "full",
}) {
  useEffect(() => {
    if (layer !== "background") {
      onReady?.();
    }
  }, [onReady, layer]);

  const background = (
    <div className={`absolute inset-0 ${layer === "background" ? "" : "-z-10"}`}>
      <div className="waves-bg h-full w-full" />
      <div className="pointer-events-none absolute inset-0 vignette-strong" />
    </div>
  );

  const content = (
    <div className="relative min-h-screen text-white">
      <PlayerStageShell>
        <PreviewScreen
          mask={mask}
          countdownSec={countdownSec}
          playerCount={playerCount}
        />
      </PlayerStageShell>
    </div>
  );

  if (layer === "background") {
    return background;
  }
  if (layer === "content") {
    return content;
  }
  return (
    <>
      {background}
      {content}
    </>
  );
}
