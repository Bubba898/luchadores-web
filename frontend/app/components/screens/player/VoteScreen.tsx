"use client";

import {useEffect, useMemo, useState} from "react";
import Button from "../../../components/Button";
import {getVoteMaskLayout} from "@/app/components/screens/maskLayout";

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
  showMaskOnVote?: boolean;
  onVote: (targetPlayerId: number) => void;
};

export default function VoteScreen({
  mask,
  entries,
  counts,
  likedTargets,
  countdownSec,
  showMaskOnVote = false,
  onVote,
}: VoteScreenProps) {
  const [parts, setParts] = useState<FacePart[]>([]);
  const [partSizes, setPartSizes] = useState<
    Record<string, {w: number; h: number}>
  >({});
  const [sizesReady, setSizesReady] = useState(false);

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
      setSizesReady(true);
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

  const maskLayout = useMemo(() => getVoteMaskLayout(mask), [mask]);
  const maskSrc = mask ? `/masks/${mask}` : null;

  return (
    <div className="flex h-full flex-col gap-6 pb-6 pt-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-base font-semibold ">
          {countdownSec !== null ? `${countdownSec}` : "--"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="grid grid-cols-2 gap-4">
          {entries.map((entry) => (
            <div
              key={entry.playerId}
              className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)]"
            >
            <Button
              variant="plain"
              onClick={() => {
                onVote(entry.playerId);
              }}
                className={`w-full text-left ${
                  likedTargets[entry.playerId] ? "opacity-80" : ""
                }`}
              >
                <VoteFace
                  faceImageSrc={faceImageSrc}
                  maskSrc={maskSrc}
                  placements={entry.placements}
                  partMap={partMap}
                  partSizes={partSizes}
                  maskLeftPercent={maskLayout.leftPercent}
                  maskScaleClass={maskLayout.scaleClass}
                  showMask={showMaskOnVote}
                  showParts={sizesReady}
                  debug={false}
                />
              </Button>
              <div className="mt-4 flex items-center justify-between text-sm ">
                <span className="font-medium ">
                  {entry.emoji !== null
                    ? String.fromCodePoint(entry.emoji)
                    : "🙂"}{" "}
                  {entry.name || "Player"}
                </span>
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    likedTargets[entry.playerId]
                      ? "bg-pink-500 "
                      : "bg-white/80"
                  }`}
                >
                  <span
                    className={
                      likedTargets[entry.playerId]
                        ? "animate-[heart-burst_0.6s_ease-out]"
                        : "text-pink-500"
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
    </div>
  );
}

type VoteFaceProps = {
  faceImageSrc: string;
  maskSrc: string | null;
  placements: Placement[];
  partMap: Record<string, FacePart>;
  partSizes: Record<string, {w: number; h: number}>;
  maskLeftPercent: number;
  maskScaleClass: string;
  showMask: boolean;
  showParts: boolean;
  debug: boolean;
};

function VoteFace({
  faceImageSrc,
  maskSrc,
  placements,
  partMap,
  partSizes,
  maskLeftPercent,
  maskScaleClass,
  showMask,
  showParts,
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
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-black/80" />
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
      {showMask && maskSrc ? (
        <img
          src={maskSrc}
          alt="Mask"
          className={`absolute top-0 h-full w-full object-contain ${maskScaleClass}`}
          style={{
            left: `${maskLeftPercent}%`,
            transform: "translateX(-50%)",
            transformOrigin: "top center",
            zIndex: 5,
          }}
          draggable={false}
        />
      ) : null}
      {debug ? (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-600">
          {placements.length ? `${placements.length} parts` : "no parts"}
        </div>
      ) : null}
    </div>
  );
}
