"use client";

import {useEffect, useState} from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";
const CHECK_INTERVAL_MS = 5000;

type BackendHealthBadgeProps = {
  position?: "fixed" | "absolute";
  className?: string;
};

export default function BackendHealthBadge({
  position = "fixed",
  className = "",
}: BackendHealthBadgeProps) {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [showOfflineNote, setShowOfflineNote] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: number | null = null;

    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${API_BASE}/health`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        window.clearTimeout(timeout);
        if (!isMounted) {
          return;
        }
        setIsHealthy(response.ok);
      } catch {
        if (!isMounted) {
          return;
        }
        setIsHealthy(false);
      } finally {
        if (!isMounted) {
          return;
        }
        timeoutId = window.setTimeout(checkHealth, CHECK_INTERVAL_MS);
      }
    };

    checkHealth();

    return () => {
      isMounted = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (isHealthy !== false) {
      setShowOfflineNote(false);
    }
  }, [isHealthy]);

  const label =
    isHealthy === null
      ? "Checking backend..."
      : isHealthy
        ? "Backend online"
        : "Backend offline";
  const dotClass =
    isHealthy === null
      ? "bg-amber-400"
      : isHealthy
        ? "bg-emerald-500"
        : "bg-red-500";

  const positionClass = position === "absolute" ? "absolute" : "fixed";

  return (
    <div className={`${positionClass} right-4 top-4 z-50 ${className}`.trim()}>
      <div
        className={`relative flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold text-zinc-900 shadow-lg backdrop-blur [font-family:var(--font-geist-sans),sans-serif] ${isHealthy === false ? "cursor-pointer" : ""}`.trim()}
        style={{textShadow: "none"}}
        onClick={() => {
          if (isHealthy === false) {
            setShowOfflineNote((value) => !value);
          }
        }}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
        <span>{label}</span>
      </div>
      {isHealthy === false && showOfflineNote ? (
        <div
          className="absolute right-0 mt-3 w-64 rounded-2xl border border-black/10 bg-white/95 px-4 py-3 text-xs font-medium text-zinc-800 shadow-xl [font-family:var(--font-geist-sans),sans-serif]"
          style={{textShadow: "none"}}
        >
          Backend is starting up and should be available within a few minutes.
        </div>
      ) : null}
    </div>
  );
}
