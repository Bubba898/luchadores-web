import {useEffect, useMemo, useState} from "react";
import {useFaceAssets} from "@/app/components/screens/host/useFaceAssets";

type Placement = {
  id: string;
  x: number;
  y: number;
};

type VoteEntry = {
  playerId: number;
  name: string;
  emoji: number | null;
  placements: Placement[];
};

export default function HostVoteRoom({
  onReady,
  mask,
  entries,
  counts,
  countdownSec,
}: {
  onReady?: () => void,
  mask: string | null,
  entries: VoteEntry[],
  counts: Record<number, number>,
  countdownSec: number | null,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const {partMap, partSizes} = useFaceAssets();

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
        <div className="host-eye-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_rgba(0,0,0,0.45)_60%,_rgba(0,0,0,0.75)_100%)]" />
      </div>
      <div className="place-items-center mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12 text-white sm:px-10 sm:py-16">
        <div className="mt-8 flex w-full flex-col items-center text-center">
          <p className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            {countdownSec !== null ? `${countdownSec} seonds left` : "--"}
          </p>
        </div>
        <div className="mt-8 flex w-full flex-col items-center text-center">
          <p className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Vote for your favorite faces!
          </p>
        </div>
        <div className="mt-8 grid w-full grid-cols-2 gap-6 lg:grid-cols-3">
          {entries.map((entry) => (
            <div
              key={entry.playerId}
              className="flex flex-col items-center text-center text-white"
            >
              <FaceDisplay
                faceImageSrc={faceImageSrc}
                placements={entry.placements}
                partMap={partMap}
                partSizes={partSizes}
              />
              <p className="mt-4 text-base text-white/90">
                {entry.emoji !== null
                  ? String.fromCodePoint(entry.emoji)
                  : "🙂"}{" "}
                {entry.name || "Player"}
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {counts[entry.playerId] ?? 0} votes
              </p>
            </div>
          ))}
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
};

function FaceDisplay({
  faceImageSrc,
  placements,
  partMap,
  partSizes,
}: FaceDisplayProps) {
  const [faceScale, setFaceScale] = useState(1);

  return (
    <div className="relative flex h-52 w-52 items-center justify-center sm:h-60 sm:w-60">
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
      {placements.map((placement, index) => {
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
        );
      })}
    </div>
  );
}
