import {Elysia, t} from "elysia";
import {joinPlayer, leavePlayerBySocket} from "../memory/rooms";

const playerJoinQuery = t.Object({
  code: t.String(),
  name: t.String(),
  emoji: t.Optional(t.Number()),
});

export const playerWsRoute = new Elysia().ws("/player", {
  query: playerJoinQuery,
  open(ws) {
    const {code, name, emoji} = ws.data.query;
    // @ts-ignore - Type mismatch between Elysia WebSocket and ServerWebSocket type
    const player = joinPlayer(code, name, emoji ?? null, ws.raw);
    if (!player) {
      ws.close(1008, "Room not found");
    }
  },
  close(ws) {
    // @ts-ignore - Type mismatch between Elysia WebSocket and ServerWebSocket type
    leavePlayerBySocket(ws.raw);
  },
});
