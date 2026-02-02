"use client";

import {useEffect, useState} from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";
const CHECK_INTERVAL_MS = 5000;

export default function BackendHealthBadge() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

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

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold text-zinc-900 shadow-lg backdrop-blur">
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      <span>{label}</span>
    </div>
  );
}
