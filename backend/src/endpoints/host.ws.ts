import {Elysia, t} from "elysia";
import {joinHost} from "../memory/rooms";
import {Host} from "../types/room";

const hostJoinQuery = t.Object({
  code: t.String(),
});

export const hostWsRoute = new Elysia().ws("/host", {
  query: hostJoinQuery,
  open(ws) {
    const {code} = ws.data.query;
    // @ts-ignore - Type mismatch between Elysia WebSocket and ServerWebSocket type
    const host: Host = {socket: ws.raw};
    const room = joinHost(code, host);
    if (!room) {
      ws.close(1008, "Room not found");
    }
  },
});
