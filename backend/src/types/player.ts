
import {ServerWebSocket} from "bun";

export type Player = {
  id: number;
  name: string;
  emoji: number | null;
  connected: boolean;
  socket: ServerWebSocket<unknown>;
}
