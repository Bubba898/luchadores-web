import * as React from "react";
import { TransitionKind, TransitionTimings } from "./TransitionSwap";
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

export type StackedComponent = {
  key: string;
  backgroundRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  concealTransition: TransitionKind;
  revealTransition: TransitionKind;
  timings: TransitionTimings;
};

export type TransitionStackProps = {
  components: StackedComponent[];
  initialKey?: string;
  hideFromBackgroundAfterInterim?: boolean;
};

export type TransitionStackHandle = {
  transition: (key: string) => Promise<void>;
  getCurrentKey: () => string | null;
};

const HIDDEN_NEW_CLASS = "ts-hidden-new";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, Math.max(0, ms));
  });

const clearTransitionClasses = (element: HTMLElement | null) => {
  if (!element) return;
  Array.from(element.classList)
    .filter((className) => className.startsWith("ts-transition-"))
    .forEach((className) => element.classList.remove(className));
  element.classList.remove("ts-incoming");
  element.style.removeProperty("--ts-transition-duration");
  element.style.removeProperty("--ts-transition-direction");
};

export const TransitionStack = React.forwardRef<TransitionStackHandle, TransitionStackProps>(
  ({ components, initialKey, hideFromBackgroundAfterInterim = false }, ref) => {
    const runningRef = React.useRef(false);
    const currentKeyRef = React.useRef<string | null>(null);

    React.useEffect(() => {
      if (!currentKeyRef.current) {
        currentKeyRef.current = initialKey ?? components[0]?.key ?? null;
      }

      components.forEach((component) => {
        const isCurrent = component.key === currentKeyRef.current;
        if (isCurrent) {
          component.backgroundRef.current?.classList.remove(HIDDEN_NEW_CLASS);
          component.contentRef.current?.classList.remove(HIDDEN_NEW_CLASS);
        } else {
          component.backgroundRef.current?.classList.add(HIDDEN_NEW_CLASS);
          component.contentRef.current?.classList.add(HIDDEN_NEW_CLASS);
        }
      });
    }, [components, initialKey]);

    const conceal = async (component: StackedComponent | null) => {
      if (!component) return;
      const content = component.contentRef.current;
      if (content) {
        clearTransitionClasses(content);
        content.classList.add(`ts-transition-${component.concealTransition}`);
        content.style.setProperty(
          "--ts-transition-duration",
          `${Math.max(0, component.timings.conceal)}ms`,
        );
        content.style.setProperty("--ts-transition-direction", "normal");
      }
      await delay(component.timings.conceal);
      content?.classList.add(HIDDEN_NEW_CLASS);
      clearTransitionClasses(content ?? null);
    };

    const reveal = async (component: StackedComponent | null) => {
      if (!component) return;
      const content = component.contentRef.current;
      const background = component.backgroundRef.current;
      if (content) {
        clearTransitionClasses(content);
        content.classList.add(`ts-transition-${component.revealTransition}`);
        content.classList.add("ts-incoming");
        content.style.setProperty(
          "--ts-transition-duration",
          `${Math.max(0, component.timings.reveal)}ms`,
        );
        content.style.setProperty("--ts-transition-direction", "reverse");
      }
      if (background) {
        clearTransitionClasses(background);
        background.classList.add(`ts-transition-${component.revealTransition}`);
        background.classList.add(`ts-incoming`);
        background.style.setProperty(
          "--ts-transition-duration",
          `${Math.max(0, component.timings.reveal)}ms`,
        );
        background.style.setProperty("--ts-transition-direction", "reverse");
      }
      content?.classList.remove(HIDDEN_NEW_CLASS);
      background?.classList.remove(HIDDEN_NEW_CLASS);
      await delay(component.timings.reveal);
      clearTransitionClasses(content ?? null);
      clearTransitionClasses(background ?? null);
    };

    const transition = React.useCallback(
      async (key: string) => {
        if (runningRef.current) return;
        if (!key) return;

        const currentKey = currentKeyRef.current;
        if (currentKey === key) return;

        const fromComponent =
          components.find((component) => component.key === currentKey) ?? null;
        const toComponent =
          components.find((component) => component.key === key) ?? null;

        if (!toComponent) return;

        if (!currentKey) {
          currentKeyRef.current = key;
          toComponent.backgroundRef.current?.classList.remove(HIDDEN_NEW_CLASS);
          toComponent.contentRef.current?.classList.remove(HIDDEN_NEW_CLASS);
          return;
        }

        runningRef.current = true;
        await conceal(fromComponent);
        const interim = fromComponent?.timings.interim ?? 0;
        await delay(interim);
        await reveal(toComponent);
        fromComponent?.backgroundRef.current?.classList.add(HIDDEN_NEW_CLASS);
        currentKeyRef.current = key;
        runningRef.current = false;
      },
      [components],
    );

    React.useImperativeHandle(
      ref,
      () => ({
        transition,
        getCurrentKey: () => currentKeyRef.current,
      }),
      [transition],
    );

    return (
      <div
        className="ts-overlay"
        style={{ display: "none" }}
        aria-hidden="true"
      />
    );
  },
);

TransitionStack.displayName = "TransitionStack";
