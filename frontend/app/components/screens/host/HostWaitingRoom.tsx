import {useEffect, useState} from "react";
import Button from "@/app/components/Button";
import QRCode from "qrcode";

export default function HostWaitingRoom({
  onReady,
  roomCode,
  playerCount,
  onStart,
}: {
  onReady?: () => void,
  roomCode?: string,
  playerCount: number,
  onStart?: () => void,
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const [hostOrigin, setHostOrigin] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostOrigin(window.location.origin);
    }
  }, []);

  const joinUrl = roomCode && hostOrigin
    ? `${hostOrigin}?roomCode=${roomCode}`
    : "";

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
    <div className="relative min-h-screen text-zinc-900 aling-items-center content-center">
      <div className="absolute inset-0 -z-10">
        <div className="pattern-tiles-bg h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_0%,_rgba(0,0,0,0.45)_60%,_rgba(0,0,0,0.75)_100%)]" />
      </div>
      <div className="place-items-center mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12 text-white sm:px-10 sm:py-16">
        <img
          src="/logo.png"
          alt="Luchadores Arena"
          className="w-[1080px] max-w-[70vw] object-contain"
        />
        <div className="-mt-20 flex w-full flex-1 flex-col items-center text-center">
          <p className="text-2xl text-white sm:text-2xl">
            <span className="font-semibold">
              {playerCount} Players Waiting...
            </span>
          </p>
          <p className="mt-4 text-12xl font-semibold tracking-[0.25em] sm:text-6xl">
            {roomCode ?? "----"}
          </p>

          <div className="mt-8 flex items-center justify-center h-96 w-96">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Join QR code"
                className="h-96 w-96 rounded-2xl bg-white p-3 object-contain "
              />
            ) : (
              <div className="flex h-60 w-60 items-center justify-center rounded-2xl border border-dashed border-white/40 text-sm text-white/70 sm:h-72 sm:w-72">
                Create a room to get a QR code.
              </div>
            )}
          </div>
          <p className="mt-6 text-xl text-white sm:text-base">
            Scan to join or go to: {joinUrl} to join
          </p>
        </div>
        <div className="mt-auto w-full max-w-md pb-2">
          <Button
            onClick={onStart}
            className="w-full min-w-[220px]"
          >
            Start Game
          </Button>
        </div>
      </div>
    </div>
  )
}
