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

  if (!winner) {
    return (
      <div className="flex h-full items-center justify-center text-lg text-zinc-700">
        Waiting for results...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 pb-10 pt-6 text-center">
      <h2 className="text-3xl font-semibold text-zinc-900 [font-family:'Archivo_Black',sans-serif]">
        Winner
      </h2>
      <div className="text-lg font-medium text-zinc-700">
        {winner.emoji !== null ? String.fromCodePoint(winner.emoji) : "🙂"}{" "}
        {winner.name || "Player"}
      </div>
      <div className="relative w-full max-w-md">
        <ResultFace
          faceImageSrc={faceImageSrc}
          placements={winner.placements}
          partMap={partMap}
          partSizes={partSizes}
        />
      </div>
    </div>
  );
}

type ResultFaceProps = {
  faceImageSrc: string;
  placements: Placement[];
  partMap: Record<string, FacePart>;
  partSizes: Record<string, {w: number; h: number}>;
};

function ResultFace({
  faceImageSrc,
  placements,
  partMap,
  partSizes,
}: ResultFaceProps) {
  const [faceScale, setFaceScale] = useState(1);

  return (
    <div className="relative flex w-full items-center justify-center">
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
