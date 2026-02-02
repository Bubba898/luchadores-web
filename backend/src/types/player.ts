
import {ServerWebSocket} from "bun";

export type PartPlacement = {
  id: string;
  x: number;
  y: number;
};

export type Player = {
  id: number;
  name: string;
  emoji: number | null;
  connected: boolean;
  socket: ServerWebSocket<unknown>;
  placements: PartPlacement[];
}
