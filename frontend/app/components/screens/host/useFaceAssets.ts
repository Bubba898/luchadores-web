"use client";

import {useEffect, useMemo, useState} from "react";

type FacePart = {
  id: string;
  type: number;
  image: string;
  weight: number;
};

export function useFaceAssets() {
  const [parts, setParts] = useState<FacePart[]>([]);
  const [partSizes, setPartSizes] = useState<
    Record<string, {w: number; h: number}>
  >({});

  useEffect(() => {
    let active = true;
    const loadParts = async () => {
      const response = await fetch("/faceParts.json");
      const data = (await response.json()) as {faceParts: FacePart[]};
      if (!active) {
        return;
      }
      const nextParts = data.faceParts ?? [];
      setParts(nextParts);
      const sizes: Record<string, {w: number; h: number}> = {};
      await Promise.all(
        nextParts.map(
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
      if (active) {
        setPartSizes(sizes);
      }
    };
    loadParts();
    return () => {
      active = false;
    };
  }, []);

  const partMap = useMemo(() => {
    return parts.reduce<Record<string, FacePart>>((acc, part) => {
      acc[part.id] = part;
      return acc;
    }, {});
  }, [parts]);

  return {partMap, partSizes};
}
