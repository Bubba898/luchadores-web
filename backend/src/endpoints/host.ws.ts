import {Elysia, t} from "elysia";
import {advanceFromJoinPhase, joinHost} from "../memory/rooms";
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
  message(ws, message) {
    try {
      const raw =
        typeof message === "string"
          ? message
          : message instanceof Uint8Array
            ? Buffer.from(message).toString()
            : JSON.stringify(message);
      const parsed = JSON.parse(raw) as {messageType?: string};
      if (parsed.messageType === "start") {
        //@ts-ignore
        advanceFromJoinPhase(ws.raw);
      }
    } catch {
      // Ignore malformed messages.
    }
  },
});
