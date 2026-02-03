import {ScreenState} from "@/app/components/screens/screenState";
import {RefObject, useEffect, useState} from "react";
import RoomSettingsForm, {DEFAULT_ROOM_SETTINGS} from "@/app/components/RoomSettingsForm";
import Button from "@/app/components/Button";
import {treaty} from "@elysiajs/eden";
import type {App} from "../../../../../backend/src";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";
const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? "ws://localhost:3001";
//@ts-ignore
const api = treaty<App>(API_BASE);


export default function HostRoom({
  setScreen,
  onReady,
  hostSocketRef,
  setRoomCode,
  onHostMessage,
  layer = "full",
}: {
  setScreen: (screen: ScreenState) => Promise<void>,
  onReady?: () => void,
  hostSocketRef: RefObject<WebSocket | null>,
  setRoomCode: (code: string) => void,
  onHostMessage: (event: any) => void,
  layer?: "background" | "content" | "full",
}) {
    useEffect(() => {
    if (layer !== "background") {
      onReady?.();
    }
  }, [onReady, layer]);

  const [settings, setSettings] = useState(DEFAULT_ROOM_SETTINGS);


  const connectHostSocket = (code: string) => {
    setRoomCode(code);
    hostSocketRef.current?.close();

    const socket = new WebSocket(`${WS_BASE}/host?code=${code.trim()}`);
    hostSocketRef.current = socket;

    socket.addEventListener("message", onHostMessage);
  };


  const createAndConnect = async () => {
    try {
      const {data, error} = await api.rooms.post(settings);
      if (error || !data) {
        throw new Error("Create room failed");
      }
      connectHostSocket(data.code);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
    }
  };

  const background = (
    <div className={`absolute inset-0 ${layer === "background" ? "" : "-z-10"}`}>
      <div className="pattern-chevron-bg h-full w-full" />
      <div className="pointer-events-none absolute inset-0 vignette-strong" />
    </div>
  );

  const content = (
    <div className="relative min-h-screen text-zinc-900 aling-items-center content-center">
      <div className="absolute left-6 top-16 z-10">
        <Button
          variant="plain"
          onClick={() => setScreen("home")}
          className="text-white text-sm uppercase tracking-[0.2em]"
        >
          Back
        </Button>
      </div>
      <div className="place-items-center mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12 sm:px-10 sm:py-16">
        <img
          src="/logo.png"
          alt="Luchadores Arena"
          data-home-logo
          className="w-[1080px] max-w-[70vw] object-contain cursor-pointer"
        />
        <div className="mt-6 w-full">
          <RoomSettingsForm
            settings={settings}
            onChange={setSettings}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={createAndConnect}
            className="min-w-[220px]"
          >
            Create Room
          </Button>
        </div>
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
