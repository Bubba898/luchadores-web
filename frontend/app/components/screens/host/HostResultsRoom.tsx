import {useEffect, useMemo, useState} from "react";
import {useFaceAssets} from "@/app/components/screens/host/useFaceAssets";
import Button from "@/app/components/Button";

type Placement = {
  id: string;
  x: number;
  y: number;
};

type Winner = {
  playerId: number;
  name: string;
  emoji: number | null;
  placements: Placement[];
};

export default function HostResultsRoom({
  onReady,
  mask,
  winner,
  votes,
  onRestart,
}: {
  onReady?: () => void,
  mask: string | null,
  winner: Winner | null,
  votes: number | null,
  onRestart?: () => void,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const {partMap, partSizes} = useFaceAssets();
  const sizesReady = Object.keys(partSizes).length > 0;

  const faceImageSrc = useMemo(() => {
    if (!mask) {
      return "/faces/head_base1.png";
    }
    const match = mask.match(/(\d+)/);
    const index = match?.[1] ?? "1";
    return `/faces/head_base${index}.png`;
  }, [mask]);

  return (
    <div className="relative min-h-screen text-zinc-900 aling-items-center content-center">
      <div className="absolute inset-0 -z-10">
        <div className="pattern-rings-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 vignette-strong" />
      </div>
      <div className="place-items-center mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12 text-white sm:px-10 sm:py-16">
        <div className="mt-40 flex w-full flex-1 flex-col items-center text-center">
          <p className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            And the winner is:
          </p>
          <p className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            {winner
              ? `${winner.emoji !== null ? String.fromCodePoint(winner.emoji) : "🙂"} ${winner.name || "Player"}`
              : "Waiting for results..."}
          </p>
          <div className="mt-8 flex h-80 w-80 items-center justify-center sm:h-96 sm:w-96">
            {winner ? (
              <FaceDisplay
                faceImageSrc={faceImageSrc}
                placements={winner.placements}
                partMap={partMap}
                partSizes={partSizes}
                showParts={sizesReady}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-white/40 text-sm text-white/70">
                Waiting for winner...
              </div>
            )}
          </div>
          {winner ? (
            <p className="mt-6 text-2xl font-semibold text-white">
              {votes ?? 0} votes
            </p>
          ) : null}
        </div>
        <div className="mt-auto flex w-full justify-center pb-2">
          <Button
            onClick={onRestart}
            className="min-w-[220px]"
          >
            Restart
          </Button>
        </div>
      </div>
    </div>
  )
}

type FaceDisplayProps = {
  faceImageSrc: string;
  placements: Placement[];
  partMap: Record<string, {id: string; image: string}>;
  partSizes: Record<string, {w: number; h: number}>;
  showParts: boolean;
};

function FaceDisplay({
  faceImageSrc,
  placements,
  partMap,
  partSizes,
  showParts,
}: FaceDisplayProps) {
  const [faceScale, setFaceScale] = useState(1);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <img
        src={faceImageSrc}
        alt="Face base"
        className="w-full object-contain"
        onLoad={(event) => {
          const img = event.currentTarget;
          if (img.naturalWidth > 0) {
            setFaceScale(img.clientWidth / img.naturalWidth);
          }
        }}
      />
      {showParts
        ? placements.map((placement, index) => {
        const part = partMap[placement.id];
        const imageSrc = part?.image ?? `/faceParts/${placement.id}.png`;
        const size = part?.id ? partSizes[part.id] : undefined;
        const x = Number(placement.x);
        const y = Number(placement.y);
        return (
          <img
            key={`${placement.id}-${index}`}
            src={imageSrc}
            alt={placement.id}
            className="absolute select-none"
            style={{
              left: `${Number.isFinite(x) ? x : 0}%`,
              top: `${Number.isFinite(y) ? y : 0}%`,
              transform: "translate(-50%, -50%)",
              width: size ? size.w * faceScale : undefined,
              height: size ? size.h * faceScale : undefined,
            }}
            draggable={false}
          />
        )
      })
        : null}
    </div>
  );
}
