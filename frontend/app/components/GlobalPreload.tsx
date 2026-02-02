"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type AssetListResponse = {
  assets: string[];
};

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];

let preloadPromise: Promise<void> | null = null;
let preloadDone = false;

function isImageAsset(assetPath: string) {
  return IMAGE_EXTENSIONS.some((ext) => assetPath.endsWith(ext));
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    const done = () => resolve();
    img.onload = done;
    img.onerror = done;
    img.src = src;
  });
}

async function fetchAssetList() {
  const response = await fetch("/api/preload", { cache: "no-store" });
  if (!response.ok) {
    return [];
  }
  const data = (await response.json()) as AssetListResponse;
  return Array.isArray(data.assets) ? data.assets : [];
}

async function preloadAssets() {
  if (preloadDone) {
    return;
  }
  if (!preloadPromise) {
    preloadPromise = (async () => {
      const assetList = await fetchAssetList();
      const tasks = assetList.map((asset) =>
        isImageAsset(asset)
          ? preloadImage(asset)
          : fetch(asset, { cache: "force-cache" })
              .then(() => undefined)
              .catch(() => undefined),
      );
      await Promise.all(tasks);
      preloadDone = true;
    })().catch(() => {
      preloadDone = true;
    });
  }
  return preloadPromise;
}

export default function GlobalPreload({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(!preloadDone);
  const [transitionState, setTransitionState] = useState<
    "idle" | "cover" | "reveal"
  >("idle");
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const transitionTimers = useRef<number[]>([]);

  useEffect(() => {
    let active = true;
    preloadAssets().finally(() => {
      if (active) {
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (loading) {
      window.scrollTo(0, 0);
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    } else {
      html.style.overflow = "";
      body.style.overflow = "";
      window.scrollTo(0, 0);
    }
    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
    };
  }, [loading]);

  useEffect(() => {
    if (previousPath.current === pathname) {
      return;
    }
    previousPath.current = pathname;

    transitionTimers.current.forEach((timer) => window.clearTimeout(timer));
    transitionTimers.current = [];

    setTransitionState("cover");
    transitionTimers.current.push(
      window.setTimeout(() => {
        setTransitionState("reveal");
      }, 600),
    );
    transitionTimers.current.push(
      window.setTimeout(() => {
        setTransitionState("idle");
      }, 1200),
    );

    return () => {
      transitionTimers.current.forEach((timer) => window.clearTimeout(timer));
      transitionTimers.current = [];
    };
  }, [pathname]);

  return (
    <>
      <div className={loading ? "invisible" : "visible"}>{children}</div>
      <div
        className={`screen-wipe ${
          transitionState === "cover"
            ? "screen-wipe--cover"
            : transitionState === "reveal"
              ? "screen-wipe--reveal"
              : ""
        }`}
        aria-hidden="true"
      />
      {loading ? (
        <div
          className="h-full host-eye-bg host-eye-vignette fixed inset-0 z-50 flex items-center justify-center"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="relative w-96 z-10 flex flex-col items-center gap-4 text-white">
            <img
              src="/logo.png"
              alt="Los Luchadores"
              className="w-[1080px] max-w-[70vw] object-contain"
            />
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-white/40 border-t-white" />
            <span className="text-2xl tracking-wide">Loading game...</span>
          </div>
        </div>
      ) : null}
    </>
  );
}
