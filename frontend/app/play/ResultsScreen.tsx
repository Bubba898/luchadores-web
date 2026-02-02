"use client";

import {useEffect, useMemo, useState} from "react";

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
} | null;

type FacePart = {
  id: string;
  type: number;
  image: string;
  weight: number;
};

type ResultsScreenProps = {
  mask: string | null;
  winner: Winner;
};

export default function ResultsScreen({mask, winner}: ResultsScreenProps) {
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

  const maskLayout = useMemo(() => {
    if (!mask) {
      return {leftPercent: 50, scaleClass: "scale-[0.75]"};
    }
    if (mask.includes("2")) {
      return {leftPercent: 30, scaleClass: "scale-[0.65]"};
    }
    return {leftPercent: 50, scaleClass: "scale-[0.75]"};
  }, [mask]);

  if (!winner) {
    return (
      <div className="flex h-full items-center justify-center text-lg ">
        Waiting for results...
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col items-center pb-8 pt-6 text-center">
      <h2 className="font-medium text-6xl font-semibold">
        WINNER!
      </h2>
      <div className="text-lg font-medium ">
        {winner.emoji !== null ? String.fromCodePoint(winner.emoji) : "🙂"}{" "}
        {winner.name || "Player"}
      </div>
      <div className="absolute bottom-0 left-1/2 w-full max-w-md -translate-x-1/2">
        <ResultFace
          faceImageSrc={faceImageSrc}
          maskSrc={mask ? `/masks/${mask}` : null}
          placements={winner.placements}
          partMap={partMap}
          partSizes={partSizes}
          maskLeftPercent={maskLayout.leftPercent}
          maskScaleClass={maskLayout.scaleClass}
        />
      </div>
    </div>
  );
}

type ResultFaceProps = {
  faceImageSrc: string;
  maskSrc: string | null;
  placements: Placement[];
  partMap: Record<string, FacePart>;
  partSizes: Record<string, {w: number; h: number}>;
  maskLeftPercent: number;
  maskScaleClass: string;
};

function ResultFace({
  faceImageSrc,
  maskSrc,
  placements,
  partMap,
  partSizes,
  maskLeftPercent,
  maskScaleClass,
}: ResultFaceProps) {
  const [faceScale, setFaceScale] = useState(1);

  return (
    <div className="relative flex w-full items-center justify-center">
      <style jsx>{`
        @keyframes drop-in {
          0% {
            transform: translate(-50%, -50%) translateY(-120vh);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) translateY(0);
            opacity: 1;
          }
        }
        @keyframes drop-in-mask {
          0% {
            transform: translateY(-120vh);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
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
              animation: "drop-in 1.4s ease-out forwards",
              animationDelay: `${index * 0.08}s`,
            }}
            draggable={false}
          />
        );
      })}
      {maskSrc ? (
        <div
          className={`absolute top-0 h-full w-full ${maskScaleClass}`}
          style={{
            left: `${maskLeftPercent}%`,
            transform: "translateX(-50%)",
            transformOrigin: "top center",
            zIndex: 5,
          }}
        >
          <img
            src={maskSrc}
            alt="Mask"
            className="h-full w-full object-contain"
            style={{
              animation: "drop-in-mask 2.6s ease-out forwards",
              animationDelay: "0.8s",
            }}
            draggable={false}
          />
        </div>
      ) : null}
    </div>
  );
}
