import * as React from "react";
import "../transition-swap.css";
import "../transition-fade.css";
import "../transition-wipe.css";
import "../transition-slide-left.css";
import "../transition-slide-right.css";
import "../transition-slide-up.css";
import "../transition-slide-down.css";
import "../transition-zoom-in.css";
import "../transition-zoom-out.css";
import "../transition-iris.css";
import "../transition-eyelid.css";
import "../transition-curtain.css";
import "../transition-skew.css";
import "../transition-blur.css";
import "../transition-stripes.css";
import "../transition-diamond.css";
import "../transition-zigzag.css";
import "../transition-shatter.css";
import "../transition-slice.css";
import "../transition-frame.css";
import "../transition-slit.css";
import "../transition-corner.css";
import "../transition-ripple.css";
import "../transition-radar.css";
import "../transition-comet.css";
import "../transition-triad.css";
import "../transition-saw.css";
import "../transition-tunnel.css";
import "../transition-prism.css";

export type TransitionKind =
  | "wipe"
  | "fade"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down"
  | "zoom-in"
  | "zoom-out"
  | "iris"
  | "eyelid"
  | "curtain"
  | "skew"
  | "blur"
  | "stripes"
  | "diamond"
  | "zigzag"
  | "shatter"
  | "slice"
  | "frame"
  | "slit"
  | "corner"
  | "ripple"
  | "radar"
  | "comet"
  | "triad"
  | "saw"
  | "tunnel"
  | "prism";

export type TransitionTimings = {
  conceal: number;
  interim: number;
  reveal: number;
};

export type TransitionSwapProps = {
  originalBackgroundRef: React.RefObject<HTMLElement>;
  originalContentRef: React.RefObject<HTMLElement>;
  newBackgroundRef: React.RefObject<HTMLElement>;
  newContentRef: React.RefObject<HTMLElement>;
  revealTransition: TransitionKind;
  concealTransition: TransitionKind;
  timings: TransitionTimings;
};

export type TransitionSwapHandle = {
  start: () => Promise<void>;
};

const HIDDEN_NEW_CLASS = "ts-hidden-new";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, Math.max(0, ms));
  });

export const TransitionSwap = React.forwardRef<TransitionSwapHandle, TransitionSwapProps>(
  (
    {
      originalBackgroundRef,
      originalContentRef,
      newBackgroundRef,
      newContentRef,
      revealTransition,
      concealTransition = revealTransition,
      timings,
    },
    ref,
  ) => {
    const overlayRef = React.useRef<HTMLDivElement>(null);
    const originalBgLayerRef = React.useRef<HTMLDivElement>(null);
    const originalContentLayerRef = React.useRef<HTMLDivElement>(null);
    const newBgLayerRef = React.useRef<HTMLDivElement>(null);
    const newContentLayerRef = React.useRef<HTMLDivElement>(null);

    const runningRef = React.useRef(false);

    React.useEffect(() => {
      const newBg = newBackgroundRef.current;
      const newContent = newContentRef.current;
      newBg?.classList.add(HIDDEN_NEW_CLASS);
      newContent?.classList.add(HIDDEN_NEW_CLASS);
      return () => {
        newBg?.classList.remove(HIDDEN_NEW_CLASS);
        newContent?.classList.remove(HIDDEN_NEW_CLASS);
      };
    }, [newBackgroundRef, newContentRef]);

    const conceal = async () => {
      const originalContent = originalContentRef.current;
      if (originalContent) {
        originalContent.classList.add(`ts-transition-${concealTransition}`);
        originalContent.style.setProperty(
          "--ts-transition-duration",
          `${Math.max(0, timings.conceal)}ms`,
        );
        originalContent.style.setProperty(
          "--ts-transition-direction",
          "normal",
        );
      }
      await delay(timings.conceal);
      originalContent?.classList.add(HIDDEN_NEW_CLASS);
    }

    const reveal = async () => {
      const newContent = newContentRef.current;
      const newBackground = newBackgroundRef.current;
      if (newContent) {
        newContent.classList.add(`ts-transition-${revealTransition}`);
        newContent.classList.add(`ts-incoming`);

        newContent.style.setProperty(
          "--ts-transition-duration",
          `${Math.max(0, timings.reveal)}ms`,
        )
        newContent.style.setProperty(
          "--ts-transition-direction",
          "reverse",
        )
      }
      if (newBackground) {
        newBackground.classList.add(`ts-transition-${revealTransition}`);
        newBackground.classList.add(`ts-incoming`);
        newBackground.style.setProperty(
          "--ts-transition-duration",
          `${Math.max(0, timings.reveal)}ms`,
        )
        newBackground.style.setProperty(
          "--ts-transition-direction",
          "reverse",
        )
      }
      newContent?.classList.remove(HIDDEN_NEW_CLASS)
      newBackground?.classList.remove(HIDDEN_NEW_CLASS)
      await delay(timings.reveal);
    }


    const start = React.useCallback(async () => {
      if (runningRef.current) return;
      runningRef.current = true;
      await conceal();
      await delay(timings.interim);
      await reveal();
      originalBackgroundRef.current?.classList.add(HIDDEN_NEW_CLASS);
      runningRef.current = false;
    }, [
      newBackgroundRef,
      originalContentRef,
      newBackgroundRef,
      newContentRef,
      revealTransition,
      concealTransition,
      timings,
    ]);

    React.useImperativeHandle(ref, () => ({ start }), [start]);

    return (
      <div
        ref={overlayRef}
        className="ts-overlay"
        style={{ display: "none" }}
        aria-hidden="true"
      >
        <div ref={originalBgLayerRef} className="ts-layer ts-bg" />
        <div ref={originalContentLayerRef} className="ts-layer ts-content" />
        <div ref={newBgLayerRef} className="ts-layer ts-bg" />
        <div ref={newContentLayerRef} className="ts-layer ts-content" />
      </div>
    );
  },
);

TransitionSwap.displayName = "TransitionSwap";
