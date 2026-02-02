"use client";

import {useEffect, useRef, useState} from "react";

const STORAGE_KEY = "luchadores-muted";
const AUDIO_SRC = "/audio/luchador_bgm.wav";

const getGlobalAudio = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const existing = (window as any).__luchaBgm as HTMLAudioElement | undefined;
  if (existing) {
    return existing;
  }
  const audio = new Audio(AUDIO_SRC);
  audio.loop = true;
  audio.volume = 0.5;
  (window as any).__luchaBgm = audio;
  return audio;
};

export default function GlobalAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  const listenersAttached = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    audioRef.current = getGlobalAudio();
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setMuted(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, String(muted));
    (window as any).__luchaMuted = muted;
    mutedRef.current = muted;
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.muted = muted;
    if (muted) {
      audio.pause();
    } else if (audio.paused) {
      audio.play().catch(() => {
        // Autoplay may be blocked until user interaction.
      });
    }
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current ?? getGlobalAudio();
    if (!audio) {
      return;
    }
    audio.muted = mutedRef.current;

    const tryPlay = () => {
      if (!audio || mutedRef.current || !audio.paused) {
        return;
      }
      audio.play().catch(() => {
        // Autoplay may be blocked until user interaction.
      });
    };

    const handleFirstInteraction = () => {
      tryPlay();
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    tryPlay();
    if (!listenersAttached.current) {
      listenersAttached.current = true;
      window.addEventListener("pointerdown", handleFirstInteraction);
      window.addEventListener("keydown", handleFirstInteraction);
    }
    return () => {
      // Keep listeners for the singleton audio instance.
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} preload="auto" />
      <button
        type="button"
        onClick={() => setMuted((value) => !value)}
        aria-label={muted ? "Unmute audio" : "Mute audio"}
        title={muted ? "Unmute" : "Mute"}
        className="fixed left-4 top-4 z-[999] flex h-10 w-10 items-center justify-center rounded-full border border-black/30 bg-black/60 text-lg text-white backdrop-blur"
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </>
  );
}
