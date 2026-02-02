"use client";

import QRCode from "qrcode";
import {useEffect, useState} from "react";

type WaitingRoomProps = {
  countdownSec: number | null;
  playerCount: number;
  roomCode?: string | null;
  joinUrl?: string | null;
};

export default function WaitingRoom({
  countdownSec,
  playerCount,
  roomCode = null,
  joinUrl = null,
}: WaitingRoomProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!joinUrl) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(joinUrl, {margin: 1, width: 420})
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [joinUrl]);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 pb-24 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Waiting Room
      </p>
      {countdownSec !== null ? (
        <p className="text-6xl font-semibold text-zinc-950 [font-family:'Archivo_Black',sans-serif] sm:text-7xl">
          {countdownSec}s
        </p>
      ) : null}
      <p className="text-lg text-zinc-600">
        {countdownSec !== null
          ? "Waiting for players to join"
          : "Waiting for the host to start"}
      </p>
      {roomCode ? (
        <div className="flex w-full max-w-3xl flex-col items-center gap-4 text-center">
          {joinUrl ? (
            <div className="mt-2 flex flex-col items-center gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                Scan to join
              </p>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Join room QR code"
                  className="h-72 w-72 rounded-3xl bg-white/85 p-4 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.5)] sm:h-80 sm:w-80"
                />
              ) : (
                <div className="flex h-72 w-72 items-center justify-center rounded-3xl border border-dashed border-white/70 text-xs text-zinc-500 sm:h-80 sm:w-80">
                  Generating QR...
                </div>
              )}
            </div>
          ) : null}
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
            Room Code
          </p>
          <p className="text-5xl font-semibold tracking-[0.2em] text-zinc-950 [font-family:'Archivo_Black',sans-serif] sm:text-6xl">
            {roomCode}
          </p>
        </div>
      ) : null}
      <div className="fixed bottom-0 left-0 right-0 mx-auto flex w-full max-w-4xl items-center justify-between border-t border-white/60 bg-white/80 px-6 py-4 pb-[env(safe-area-inset-bottom)] text-sm text-zinc-700 backdrop-blur">
        <span>Players connected</span>
        <span className="text-lg font-semibold text-zinc-900">
          {playerCount}
        </span>
      </div>
    </div>
  );
}
