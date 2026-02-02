"use client";

import {useEffect, useRef, useState} from "react";

const STORAGE_KEY = "luchadores-muted";

export default function GlobalAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
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
    if (audioRef.current) {
      audioRef.current.muted = muted;
      if (muted) {
        audioRef.current.pause();
      } else if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {
          // Autoplay may be blocked until user interaction.
        });
      }
    }
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.loop = true;
    audio.volume = 0.5;
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
    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/audio/luchador_bgm.wav" preload="auto" />
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
