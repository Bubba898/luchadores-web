"use client";

import {useEffect, useMemo, useRef, useState} from "react";

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
  onPartDrop: (partId: string, xPercent: number, yPercent: number) => void;
};

const SPAWN_POINTS = {
  2: {x: 18, y: 78},
  1: {x: 50, y: 78},
  0: {x: 82, y: 78},
};

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export default function BuildScreen({onPartDrop}: BuildScreenProps) {
  const [parts, setParts] = useState<FacePart[]>([]);
  const [items, setItems] = useState<BuildItem[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{x: number; y: number} | null>(
    null,
  );
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bucketRef = useRef<HTMLDivElement | null>(null);
  const faceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadParts = async () => {
      const response = await fetch("/faceParts.json");
      const data = (await response.json()) as {faceParts: FacePart[]};
      setParts(data.faceParts ?? []);
    };
    loadParts();
  }, []);

  const partsByType = useMemo(() => {
    return {
      0: parts.filter((part) => part.type === 0),
      1: parts.filter((part) => part.type === 1),
      2: parts.filter((part) => part.type === 2),
    };
  }, [parts]);

  const spawnPart = (type: number) => {
    const available = partsByType[type as 0 | 1 | 2] ?? [];
    if (!available.length || !rootRef.current || !bucketRef.current) {
      return;
    }

    const part = available[Math.floor(Math.random() * available.length)];
    const rootRect = rootRef.current.getBoundingClientRect();
    const bucketRect = bucketRef.current.getBoundingClientRect();

    const spawn = SPAWN_POINTS[type as 0 | 1 | 2];
    const startX = (spawn.x / 100) * rootRect.width;
    const startY = (spawn.y / 100) * rootRect.height;
    const targetX =
      bucketRect.left -
      rootRect.left +
      randomInRange(20, bucketRect.width - 60);
    const targetY =
      bucketRect.top -
      rootRect.top +
      randomInRange(20, bucketRect.height - 60);

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
    const target = event.currentTarget.getBoundingClientRect();
    setDraggingId(instanceId);
    setDragOffset({
      x: event.clientX - target.left,
      y: event.clientY - target.top,
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
      const rootRect = rootRef.current.getBoundingClientRect();
      const nextX = event.clientX - rootRect.left - dragOffset.x;
      const nextY = event.clientY - rootRect.top - dragOffset.y;
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
      const rootRect = rootRef.current.getBoundingClientRect();
      const faceRect = faceRef.current.getBoundingClientRect();
      const pointerX = event.clientX;
      const pointerY = event.clientY;
      const isOverFace =
        pointerX >= faceRect.left &&
        pointerX <= faceRect.right &&
        pointerY >= faceRect.top &&
        pointerY <= faceRect.bottom;

      if (isOverFace) {
        const faceX = ((pointerX - faceRect.left) / faceRect.width) * 100;
        const faceY = ((pointerY - faceRect.top) / faceRect.height) * 100;
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
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [draggingId, dragOffset, onPartDrop, items]);

  return (
    <div ref={rootRef} className="relative flex h-full flex-col pb-32">
      <div className="flex flex-col items-center gap-6">
        <div
          ref={faceRef}
          className="relative flex w-full max-w-3xl items-center justify-center"
        >
          <img
            src="/faces/head_base1.png"
            alt="Face base"
            className="w-full object-contain"
          />
          {items
            .filter((item) => item.location === "face")
            .map((item) => (
              <img
                key={item.instanceId}
                src={item.part.image}
                alt={item.part.id}
                className="absolute select-none"
                style={{
                  left: `${item.faceX ?? 0}%`,
                  top: `${item.faceY ?? 0}%`,
                  transform: "translate(-50%, -50%)",
                }}
                draggable={false}
              />
            ))}
        </div>

        <div
          ref={bucketRef}
          className="relative flex w-screen -mx-5 sm:-mx-8 -my-12 justify-center"
        >
          <img
            src="/ui/UI_Bucket.png"
            alt="Bucket"
            className="h-[95%] w-[95%] object-fill"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t px-6 py-5 ">
        <div className="mx-auto flex w-full max-w-none items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => spawnPart(2)}
            className="flex h-80 flex-1 items-center justify-center rounded-2xl bg-transparent px-4 py-4 text-sm uppercase tracking-[0.2em] text-transparent"
          >
            Mouth
          </button>
          <button
            type="button"
            onClick={() => spawnPart(1)}
            className="flex h-80 flex-1 items-center justify-center rounded-2xl bg-transparent px-4 py-4 text-sm uppercase tracking-[0.2em] text-transparent"
          >
            Nose
          </button>
          <button
            type="button"
            onClick={() => spawnPart(0)}
            className="flex h-80 flex-1 items-center justify-center rounded-2xl bg-transparent px-4 py-4 text-sm uppercase tracking-[0.2em] text-transparent"
          >
            Eyes
          </button>
        </div>
        <div className="pointer-events-none absolute inset-0 mx-auto flex w-[90%] items-center justify-center ">
          <img
            src="/ui/dispenser.png"
            alt="Dispenser"
            className="w-screen object-fill"
          />
        </div>
      </div>

      {items
        .filter((item) => item.location !== "face")
        .map((item) => (
          <button
            key={item.instanceId}
            type="button"
            onPointerDown={(event) => handlePointerDown(event, item.instanceId)}
            className="absolute rounded-2xl bg-transparent p-0 shadow-none transition-all duration-700"
            style={{
              left: item.x,
              top: item.y,
            }}
          >
            <img
              src={item.part.image}
              alt={item.part.id}
              className="select-none"
              draggable={false}
            />
          </button>
        ))}
    </div>
  );
}
