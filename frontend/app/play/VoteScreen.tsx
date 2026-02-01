"use client";

import {useEffect, useMemo, useState} from "react";

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

type FacePart = {
  id: string;
  type: number;
  image: string;
  weight: number;
};

type VoteScreenProps = {
  mask: string | null;
  entries: VoteEntry[];
  counts: Record<number, number>;
  likedTargets: Record<number, boolean>;
  countdownSec: number | null;
  onVote: (targetPlayerId: number) => void;
};

export default function VoteScreen({
  mask,
  entries,
  counts,
  likedTargets,
  countdownSec,
  onVote,
}: VoteScreenProps) {
  const [parts, setParts] = useState<FacePart[]>([]);
  const [partSizes, setPartSizes] = useState<
    Record<string, {w: number; h: number}>
  >({});

  useEffect(() => {
    const loadParts = async () => {
      const response = await fetch("/faceParts.json");
      const data = (await response.json()) as {faceParts: FacePart[]};
      setParts(data.faceParts ?? []);
      const sizes: Record<string, {w: number; h: number}> = {};
      await Promise.all(
        (data.faceParts ?? []).map(
          (part) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => {
                sizes[part.id] = {w: img.naturalWidth, h: img.naturalHeight};
                resolve();
              };
              img.onerror = () => resolve();
              img.src = part.image;
            }),
        ),
      );
      setPartSizes(sizes);
    };
    loadParts();
  }, []);

  const partMap = useMemo(() => {
    return parts.reduce<Record<string, FacePart>>((acc, part) => {
      acc[part.id] = part;
      return acc;
    }, {});
  }, [parts]);

  const faceImageSrc = useMemo(() => {
    if (!mask) {
      return "/faces/head_base1.png";
    }
    const match = mask.match(/(\d+)/);
    const index = match?.[1] ?? "1";
    return `/faces/head_base${index}.png`;
  }, [mask]);

  return (
    <div className="flex h-full flex-col gap-6 pb-10 pt-6">
      <div className="flex items-center justify-between text-sm text-zinc-700">
        <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Vote
        </span>
        <span className="text-base font-semibold text-zinc-900">
          {countdownSec !== null ? `${countdownSec}s left` : "--"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {entries.map((entry) => (
          <div
            key={entry.playerId}
            className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)]"
          >
            <button
              type="button"
              onClick={() => {
                onVote(entry.playerId);
              }}
              className={`w-full text-left ${
                likedTargets[entry.playerId] ? "opacity-80" : ""
              }`}
            >
              <VoteFace
                faceImageSrc={faceImageSrc}
                placements={entry.placements}
                partMap={partMap}
                partSizes={partSizes}
                debug={false}
              />
            </button>
            <div className="mt-4 flex items-center justify-between text-sm text-zinc-700">
              <span className="font-medium text-zinc-900">
                {entry.emoji !== null
                  ? String.fromCodePoint(entry.emoji)
                  : "🙂"}{" "}
                {entry.name || "Player"}
              </span>
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  likedTargets[entry.playerId]
                    ? "bg-pink-500 text-white"
                    : "bg-white/80 text-zinc-700"
                }`}
              >
                <span
                  className={
                    likedTargets[entry.playerId]
                      ? "animate-[heart-burst_0.6s_ease-out]"
                      : ""
                  }
                >
                  ❤
                </span>
                {counts[entry.playerId] ?? 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type VoteFaceProps = {
  faceImageSrc: string;
  placements: Placement[];
  partMap: Record<string, FacePart>;
  partSizes: Record<string, {w: number; h: number}>;
  debug: boolean;
};

function VoteFace({
  faceImageSrc,
  placements,
  partMap,
  partSizes,
  debug,
}: VoteFaceProps) {
  const [faceScale, setFaceScale] = useState(1);

  return (
    <div className="relative flex w-full items-center justify-center">
      <style jsx>{`
        @keyframes heart-burst {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.4);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
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
      {debug ? (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-600">
          {placements.length ? `${placements.length} parts` : "no parts"}
        </div>
      ) : null}
    </div>
  );
}
