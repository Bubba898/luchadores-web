import {useEffect, useMemo, useState} from "react";
import {useFaceAssets} from "@/app/components/screens/host/useFaceAssets";
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

export default function HostVoteRoom({
  onReady,
  mask,
  entries,
  counts,
  countdownSec,
  showMaskOnVote = false,
}: {
  onReady?: () => void,
  mask: string | null,
  entries: VoteEntry[],
  counts: Record<number, number>,
  countdownSec: number | null,
  showMaskOnVote?: boolean,
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

  const maskLayout = useMemo(() => getVoteMaskLayout(mask), [mask]);
  const maskSrc = mask ? `/masks/${mask}` : null;

  return (
    <div className="relative min-h-screen text-zinc-900 aling-items-center content-center">
      <div className="absolute inset-0 -z-10">
        <div className="pattern-orbit-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 vignette-strong" />
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
        <div className="mt-8 w-full flex-1 overflow-y-auto pb-6">
          <div className="grid w-full grid-cols-2 gap-6 lg:grid-cols-3">
            {entries.map((entry) => (
              <div
                key={entry.playerId}
                className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-4 text-center text-zinc-900 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)]"
              >
                <FaceDisplay
                  faceImageSrc={faceImageSrc}
                  maskSrc={maskSrc}
                  placements={entry.placements}
                  partMap={partMap}
                  partSizes={partSizes}
                  maskLeftPercent={maskLayout.leftPercent}
                  maskScaleClass={maskLayout.scaleClass}
                  showMask={showMaskOnVote}
                  showParts={sizesReady}
                />
                <div className="mt-4 flex items-center justify-between text-sm">
                  {entry.emoji !== null
                    ? String.fromCodePoint(entry.emoji)
                    : "🙂"}{" "}
                  {entry.name || "Player"}
                  <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-700">
                    ❤ {counts[entry.playerId] ?? 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type FaceDisplayProps = {
  faceImageSrc: string;
  maskSrc: string | null;
  placements: Placement[];
  partMap: Record<string, {id: string; image: string}>;
  partSizes: Record<string, {w: number; h: number}>;
  maskLeftPercent: number;
  maskScaleClass: string;
  showMask: boolean;
  showParts: boolean;
};

function FaceDisplay({
  faceImageSrc,
  maskSrc,
  placements,
  partMap,
  partSizes,
  maskLeftPercent,
  maskScaleClass,
  showMask,
  showParts,
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
    </div>
  );
}
