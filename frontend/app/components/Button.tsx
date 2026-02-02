"use client";

import Link from "next/link";
import {useState} from "react";
import type {CSSProperties, ReactNode} from "react";

const BUTTON_BG = "/ui/button/UI_ButtonBG.png";
const BUTTON_BG_PRESSED = "/ui/button/UI_ButtonBG_Pressed.png";
const BUTTON_FRAME = "/ui/button/UI_Button_Container.png";

type ButtonVariant = "ui" | "plain";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  target?: string;
  rel?: string;
  onClick?: () => void;
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerLeave?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
};

export default function Button({
  children,
  href,
  variant = "ui",
  onClick,
  type = "button",
  disabled = false,
  className = "",
  target,
  rel,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  style,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const backgroundSrc = pressed ? BUTTON_BG_PRESSED : BUTTON_BG;

  const baseClass =
    variant === "ui"
      ? "group relative inline-flex h-28 min-w-[360px] items-center justify-center px-12 text-2xl font-semibold uppercase tracking-[0.25em] text-white [font-family:var(--font-bangers),cursive] disabled:cursor-not-allowed disabled:opacity-60"
      : "inline-flex items-center justify-center";
  const composedClass = `${baseClass} ${className}`.trim();

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={`${composedClass} ${disabled ? "pointer-events-none opacity-60" : ""}`.trim()}
        style={style}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
      >
        {variant === "ui" ? (
          <>
            <span className="pointer-events-none absolute inset-0">
              <img
                src={BUTTON_FRAME}
                alt=""
                className="h-full w-full object-fill"
                draggable={false}
              />
            </span>
            <span className="pointer-events-none absolute inset-0">
              <img
                src={backgroundSrc}
                alt=""
                className="h-full w-full scale-[0.9] translate-y-[-12%] object-fill saturate-[0.8]"
                draggable={false}
              />
            </span>
            <span
              className="relative z-10"
              style={{
                textShadow:
                  "-1px -1px 0 rgba(0,0,0,0.6), 1px -1px 0 rgba(0,0,0,0.6), -1px 1px 0 rgba(0,0,0,0.6), 1px 1px 0 rgba(0,0,0,0.6)",
              }}
            >
              {children}
            </span>
          </>
        ) : (
          children
        )}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      onPointerDown={(event) => {
        setPressed(true);
        onPointerDown?.(event);
      }}
      onPointerUp={(event) => {
        setPressed(false);
        onPointerUp?.(event);
      }}
      onPointerLeave={(event) => {
        setPressed(false);
        onPointerLeave?.(event);
      }}
      className={composedClass}
    >
      {variant === "ui" ? (
        <>
          <span className="pointer-events-none absolute inset-0">
            <img
              src={BUTTON_FRAME}
              alt=""
              className="h-full w-full object-fill"
              draggable={false}
            />
          </span>
          <span className="pointer-events-none absolute inset-0">
            <img
              src={backgroundSrc}
              alt=""
              className="h-full w-full scale-[0.9] translate-y-[-12%] object-fill saturate-[0.8]"
              draggable={false}
            />
          </span>
          <span
            className="relative z-10"
            style={{
              textShadow:
                "-1px -1px 0 rgba(0,0,0,0.6), 1px -1px 0 rgba(0,0,0,0.6), -1px 1px 0 rgba(0,0,0,0.6), 1px 1px 0 rgba(0,0,0,0.6)",
            }}
          >
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
