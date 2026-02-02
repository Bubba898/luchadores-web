"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import Button from "../../../components/Button";

type FacePart = {
  id: string;
  type: number;
  image: string;
  weight: number;
};

type BuildItem = {
  instanceId: string;
  part: FacePart;
  location: "bucket" | "dragging" | "face";
  x: number;
  y: number;
  faceX?: number;
  faceY?: number;
};

type BuildScreenProps = {
  mask: string | null;
  partLimit: number | null;
  countdownSec: number | null;
  stageScale?: number;
  onPartDrop: (partId: string, xPercent: number, yPercent: number) => void;
};

const SPAWN_POINTS = {
  2: {x: 18, y: 78},
  1: {x: 50, y: 78},
  0: {x: 82, y: 78},
};

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;
const DRAG_LIFT_PX = 90;

export default function BuildScreen({
  mask,
  partLimit,
  countdownSec,
  stageScale = 1,
  onPartDrop,
}: BuildScreenProps) {
  const [parts, setParts] = useState<FacePart[]>([]);
  const [partSizes, setPartSizes] = useState<
    Record<string, {w: number; h: number}>
  >({});
  const [items, setItems] = useState<BuildItem[]>([]);
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [faceScale, setFaceScale] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{x: number; y: number} | null>(
    null,
  );
  const [dragSize, setDragSize] = useState<{w: number; h: number} | null>(
    null,
  );
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bucketRef = useRef<HTMLDivElement | null>(null);
  const faceRef = useRef<HTMLDivElement | null>(null);
  const faceImgRef = useRef<HTMLImageElement | null>(null);

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

  const faceImageSrc = useMemo(() => {
    if (!mask) {
      return "/faces/head_base1.png";
    }
    const match = mask.match(/(\d+)/);
    const index = match?.[1] ?? "1";
    return `/faces/head_base${index}.png`;
  }, [mask]);

  const partsByType = useMemo(() => {
    return {
      0: parts.filter((part) => part.type === 0),
      1: parts.filter((part) => part.type === 1),
      2: parts.filter((part) => part.type === 2),
    };
  }, [parts]);

  const spawnPart = (type: number) => {
    if (partLimit !== null && spawnedCount >= partLimit) {
      return;
    }
    const available = partsByType[type as 0 | 1 | 2] ?? [];
    if (!available.length || !rootRef.current || !bucketRef.current) {
      return;
    }

    const part = available[Math.floor(Math.random() * available.length)];
    const scale = stageScale || 1;
    const rootRect = rootRef.current.getBoundingClientRect();
    const bucketRect = bucketRef.current.getBoundingClientRect();
    const rootWidth = rootRect.width / scale;
    const rootHeight = rootRect.height / scale;
    const bucketLeft = (bucketRect.left - rootRect.left) / scale;
    const bucketTop = (bucketRect.top - rootRect.top) / scale;
    const bucketWidth = bucketRect.width / scale;
    const bucketHeight = bucketRect.height / scale;

    const spawn = SPAWN_POINTS[type as 0 | 1 | 2];
    const startX = (spawn.x / 100) * rootWidth;
    const startY = (spawn.y / 100) * rootHeight;
    const targetX = bucketLeft + randomInRange(20, bucketWidth - 60);
    const targetY = bucketTop + randomInRange(20, bucketHeight - 60);

    const instanceId = `${part.id}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;

    const newItem: BuildItem = {
      instanceId,
      part,
      location: "bucket",
      x: startX,
      y: startY,
    };

    setItems((prev) => [...prev, newItem]);
    setSpawnedCount((count) => count + 1);

    requestAnimationFrame(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.instanceId === instanceId
            ? {...item, x: targetX, y: targetY}
            : item,
        ),
      );
    });
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    instanceId: string,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const scale = stageScale || 1;
    const target = event.currentTarget.getBoundingClientRect();
    const imgEl = event.currentTarget.querySelector("img");
    const imgRect = imgEl?.getBoundingClientRect();
    setDraggingId(instanceId);
    setDragOffset({
      x: (event.clientX - (imgRect?.left ?? target.left)) / scale,
      y: (event.clientY - (imgRect?.top ?? target.top)) / scale + DRAG_LIFT_PX,
    });
    setDragSize({
      w: (imgRect?.width ?? target.width) / scale,
      h: (imgRect?.height ?? target.height) / scale,
    });
    setItems((prev) =>
      prev.map((item) =>
        item.instanceId === instanceId
          ? {...item, location: "dragging"}
          : item,
      ),
    );
  };

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!draggingId || !dragOffset || !rootRef.current) {
        return;
      }
      const scale = stageScale || 1;
      const rootRect = rootRef.current.getBoundingClientRect();
      const nextX = (event.clientX - rootRect.left) / scale - dragOffset.x;
      const nextY = (event.clientY - rootRect.top) / scale - dragOffset.y;
      setItems((prev) =>
        prev.map((item) =>
          item.instanceId === draggingId
            ? {...item, x: nextX, y: nextY}
            : item,
        ),
      );
    };

    const handleUp = (event: PointerEvent) => {
      if (!draggingId || !dragOffset || !rootRef.current || !faceRef.current) {
        setDraggingId(null);
        setDragOffset(null);
        return;
      }
      const scale = stageScale || 1;
      const rootRect = rootRef.current.getBoundingClientRect();
      const faceRect = faceRef.current.getBoundingClientRect();
      const pointerX = (event.clientX - rootRect.left) / scale;
      const pointerY = (event.clientY - rootRect.top) / scale;
      const size = dragSize ?? {w: 0, h: 0};
      const itemLeft = pointerX - (dragOffset?.x ?? 0);
      const itemTop = pointerY - (dragOffset?.y ?? 0);
      const itemCenterX = itemLeft + size.w / 2;
      const itemCenterY = itemTop + size.h / 2;
      const faceLeft = (faceRect.left - rootRect.left) / scale;
      const faceTop = (faceRect.top - rootRect.top) / scale;
      const faceWidth = faceRect.width / scale;
      const faceHeight = faceRect.height / scale;
      const isOverFace =
        itemCenterX >= faceLeft &&
        itemCenterX <= faceLeft + faceWidth &&
        itemCenterY >= faceTop &&
        itemCenterY <= faceTop + faceHeight;

      if (isOverFace) {
        const faceX = ((itemCenterX - faceLeft) / faceWidth) * 100;
        const faceY = ((itemCenterY - faceTop) / faceHeight) * 100;
        setItems((prev) =>
          prev.map((item) =>
            item.instanceId === draggingId
              ? {
                  ...item,
                  location: "face",
                  faceX,
                  faceY,
                }
              : item,
          ),
        );
          const dropped = items.find((item) => item.instanceId === draggingId);
        if (dropped) {
          onPartDrop(dropped.part.id, faceX, faceY);
        }
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.instanceId === draggingId
              ? {...item, location: "bucket"}
              : item,
          ),
        );
      }

      setDraggingId(null);
      setDragOffset(null);
      setDragSize(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [draggingId, dragOffset, onPartDrop, items]);

  return (
    <div
      ref={rootRef}
      className="relative flex h-full flex-col pb-32 pt-12 touch-none"
    >
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-center">
        <div className="px-4 py-2 text-2xl font-semibold ">
          {countdownSec !== null
            ? `${countdownSec} seconds left`
            : "--"}
        </div>
      </div>
        <div className="px-4 py-2 text-sm font-semibold text-center">
          Click on the containers on the bottom of the screen to get different face parts
        </div>
        <div className="px-4 py-2 text-xs font-semibold text-center">
          Then drag them on the face
        </div>
      <div className="flex flex-col items-center gap-6">
        <div
          ref={faceRef}
          className="relative flex w-full max-w-3xl items-center justify-center"
        >
          <img
            ref={faceImgRef}
            src={faceImageSrc}
            alt="Face base"
            className="w-7/8 object-contain"
            onLoad={(event) => {
              const img = event.currentTarget;
              if (img.naturalWidth > 0) {
                const scale = img.clientWidth / img.naturalWidth;
                setFaceScale(scale);
              }
            }}
          />
          {items
            .filter((item) => item.location === "face")
            .map((item) => (
              (() => {
                const size = partSizes[item.part.id];
                return (
              <img
                key={item.instanceId}
                src={item.part.image}
                alt={item.part.id}
                className="absolute select-none"
                style={{
                  left: `${item.faceX ?? 0}%`,
                  top: `${item.faceY ?? 0}%`,
                  transform: "translate(-50%, -50%)",
                  width: size ? size.w * faceScale : undefined,
                  height: size ? size.h * faceScale : undefined,
                }}
                draggable={false}
              />
                );
              })()
            ))}
        </div>

        <div
          ref={bucketRef}
          className="relative -mx-5 -my-12 flex w-full justify-center h-1/2"
        >
          <img
            src="/ui/UI_Bucket.png"
            alt="Bucket"
            className="h-[95%] w-[95%] object-fill"
          />
          <div className="absolute right-[-6px] top-[-6px] h-24 w-32">
            <img
              src="/ui/UI_Bucket_PartsTracker.png"
              alt="Parts tracker"
              className="h-full w-full object-contain"
            />
            <div className="absolute inset-0 top-2 flex items-center justify-center text-4xl font-semibold text-white">
              {partLimit !== null
                ? Math.max(partLimit - spawnedCount, 0)
                : "∞"}
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute left-0 right-0 bottom-[-80px] px-6 pb-[env(safe-area-inset-bottom)]"
        style={{top: "calc(100% - 20%)"}}
      >
        <div className="relative bottom-20 mx-auto flex w-full max-w-none items-center justify-between gap-3">
          <Button
            variant="plain"
            onClick={() => spawnPart(2)}
            className="flex h-120 flex-1 items-center justify-center rounded-2xl  px-4 py-4 text-sm uppercase tracking-[0.2em] text-transparent"
          >
-
          </Button>
          <Button
            variant="plain"
            onClick={() => spawnPart(1)}
            className="flex h-120 flex-1 items-center justify-center rounded-2xl  px-4 py-4 text-sm uppercase tracking-[0.2em] text-transparent"
          >
-
          </Button>
          <Button
            variant="plain"
            onClick={() => spawnPart(0)}
            className="flex h-120 flex-1 items-center justify-center rounded-2xl  px-4 py-4 text-sm uppercase tracking-[0.2em] text-transparent"
          >
-
          </Button>
        </div>

        <div className="pointer-events-none absolute inset-0 mx-auto flex w-[90%] items-center justify-center">
          <img
            src="/ui/dispenser.png"
            alt="Dispenser"
            className="w-full object-fill"
          />
        </div>
      </div>

      {items
        .filter((item) => item.location !== "face")
        .map((item) => (
          <Button
            key={item.instanceId}
            onPointerDown={(event) => handlePointerDown(event, item.instanceId)}
            variant="plain"
            className={
              item.location === "dragging"
                ? "absolute rounded-2xl bg-transparent p-0 shadow-none touch-none select-none"
                : "absolute rounded-2xl bg-transparent p-0 shadow-none transition-all duration-700 touch-none select-none"
            }
            style={{
              left: item.x,
              top: item.y,
            }}
          >
            <img
              src={item.part.image}
              alt={item.part.id}
              className="select-none"
              style={{
                width: partSizes[item.part.id]
                  ? partSizes[item.part.id].w * faceScale
                  : undefined,
                height: partSizes[item.part.id]
                  ? partSizes[item.part.id].h * faceScale
                  : undefined,
              }}
              draggable={false}
            />
          </Button>
        ))}
    </div>
  );
}
