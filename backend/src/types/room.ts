import {ServerWebSocket} from "bun";
import {Player} from "./player";

export type Phase = "join" | "preview" | "build" | "vote" | "results";

export type RoomSettings = {
  previewTimeSec: number;
  buildTimeSec: number;
  voteTimeSec: number;
  partsPerPlayer: number;
}

export type WS = ServerWebSocket<{
  id: string;
  data: unknown;
}>

export type Host = {
  socket: WS;
}

export type Room = {
  code: string;
  createdAt: number;
  phase: Phase;
  phaseEndsAt: number | null;
  maskId: string | null;
  players: Player[];
  settings: RoomSettings;
  host: Host | null;
}
