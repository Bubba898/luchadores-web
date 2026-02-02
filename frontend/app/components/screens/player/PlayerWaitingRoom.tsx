import {useEffect, useState} from "react";
import Button from "@/app/components/Button";
import PlayerStageShell from "@/app/components/screens/player/PlayerStageShell";
import QRCode from "qrcode";

export default function PlayerWaitingRoom({
  onReady,
  roomCode,
  playerCount,
  joinUrl,
  canStart,
  onStart,
}: {
  onReady?: () => void,
  roomCode?: string,
  playerCount: number,
  joinUrl: string | null,
  canStart?: boolean,
  onStart?: () => void,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    if (!joinUrl) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 512,
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    })
      .then((dataUrl) => {
        if (isActive) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (isActive) {
          setQrDataUrl(null);
        }
      });
    return () => {
      isActive = false;
    };
  }, [joinUrl]);

  return (
    <div className="relative min-h-screen text-white aling-items-center content-center">
      <div className="absolute inset-0 -z-10">
        <div className="pattern-tiles-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 vignette-strong" />
      </div>
      <PlayerStageShell>
        <div className="flex h-full w-full flex-col items-center justify-center px-6 text-white sm:px-10">
          <div className="mt-6 flex w-full flex-1 flex-col items-center text-center">
            <p className="mt-4 text-5xl font-semibold tracking-[0.25em] sm:text-6xl">
              {roomCode ?? "----"}
            </p>
            <div className="mt-6 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Join QR code"
                  className="h-56 w-56 rounded-2xl bg-white p-3 object-contain sm:h-64 sm:w-64"
                />
              ) : (
                <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-dashed border-white/40 text-sm text-white/70 sm:h-64 sm:w-64">
                  Create a room to get a QR code.
                </div>
              )}
            </div>
            <p className="mt-6 text-lg text-white/80 sm:text-xl">
              Share to join: {joinUrl ?? "--"}
            </p>
          </div>
          {canStart ? (
            <div className="mt-auto flex w-full max-w-md justify-center pb-2">
              <Button
                onClick={onStart}
                className="min-w-[220px] scale-[0.6]"
              >
                Start Game
              </Button>
            </div>
          ) : null}
          <p className="text-2xl text-white sm:text-2xl">
            <span className="font-semibold">
              {playerCount} Players Waiting...
            </span>
          </p>
        </div>
      </PlayerStageShell>
    </div>
  );
}
