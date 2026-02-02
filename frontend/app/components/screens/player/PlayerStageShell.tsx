"use client";

import {useEffect, useState} from "react";
import type {CSSProperties, ReactNode} from "react";

export default function PlayerStageShell({
  children,
  onScaleChange,
}: {
  children: ReactNode,
  onScaleChange?: (scale: number) => void,
}) {
  const stageWidth = 390;
  const stageHeight = (stageWidth * 16) / 9;
  const [stageScale, setStageScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const nextScale = Math.min(
        window.innerWidth / stageWidth,
        window.innerHeight / stageHeight,
      );
      const safeScale = Number.isFinite(nextScale) ? nextScale : 1;
      setStageScale(safeScale);
      onScaleChange?.(safeScale);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [onScaleChange, stageHeight, stageWidth]);

  return (
    <>
      <style jsx global>{`
        .stage-shell {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .stage-9x16 {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: var(--stage-width);
          height: var(--stage-height);
          transform: translateX(-50%) scale(var(--stage-scale));
          transform-origin: bottom center;
        }
      `}</style>
      <div className="flex h-[100dvh] w-full flex-col items-center justify-end">
        <div
          className="stage-shell"
          style={{
            width: `${stageWidth * stageScale}px`,
            height: `${stageHeight * stageScale}px`,
          }}
        >
          <div
            className="stage-9x16 w-full overflow-hidden bg-transparent"
            style={
              {
                "--stage-width": `${stageWidth}px`,
                "--stage-height": `${stageHeight}px`,
                "--stage-scale": stageScale,
              } as CSSProperties
            }
          >
            <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
