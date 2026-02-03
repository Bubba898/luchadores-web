"use client";

import {useEffect, useState} from "react";
import {ScreenState} from "@/app/components/screens/screenState";

type AssetListResponse = {
  assets: string[];
};

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".ogg"];

let preloadPromise: Promise<void> | null = null;
let preloadDone = false;

function isImageAsset(assetPath: string) {
  return IMAGE_EXTENSIONS.some((ext) => assetPath.endsWith(ext));
}

function isAudioAsset(assetPath: string) {
  return AUDIO_EXTENSIONS.some((ext) => assetPath.endsWith(ext));
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

function preloadAudio(src: string) {
  return new Promise<void>((resolve) => {
    const audio = new Audio();
    const done = () => resolve();
    audio.oncanplaythrough = done;
    audio.onerror = done;
    audio.src = src;
    audio.load();
  });
}

async function fetchAssetList() {
  const response = await fetch("/api/preload", { cache: "force-cache" });
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
          : isAudioAsset(asset)
            ? preloadAudio(asset)
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

export default function LoadingScreen({
  setScreen,
  onReady,
  layer = "full",
  active = true,
}: {
  setScreen: (screen: ScreenState) => Promise<void>,
  onReady?: () => void,
  layer?: "background" | "content" | "full",
  active?: boolean,
}) {

  useEffect(() => {
    if (layer !== "background") {
      onReady?.();
    }
  }, [onReady, layer]);

  useEffect(() => {
    if (layer === "background" || !active) {
      return;
    }
    let isActive = true;
    const start = Date.now();
    preloadAssets().finally(async() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 1000 - elapsed);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      if (isActive && typeof setScreen === "function") {
        await setScreen("home")
      }
    });
    return () => {
      isActive = false;
    };
  }, [layer, active, setScreen]);

  const background = (
    <div className="fixed inset-0 host-eye-bg host-eye-vignette" />
  );

  const content = (
    <div
      className="fixed inset-0 z-500 flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative z-10 flex w-96 flex-col items-center gap-4 text-white">
        <img
          src="/logo.png"
          alt="Los Luchadores"
          data-home-logo
          className="w-[1080px] max-w-[70vw] object-contain cursor-pointer"
        />
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-white/40 border-t-white" />
        <span className="text-2xl tracking-wide">Loading game...</span>
      </div>
    </div>
  );

  if (layer === "background") {
    return background;
  }
  if (layer === "content") {
    return content;
  }
  return (
    <>
      {background}
      {content}
    </>
  );
}
