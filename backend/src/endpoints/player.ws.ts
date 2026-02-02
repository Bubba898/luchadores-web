import {Elysia, t} from "elysia";
import {handlePlayerPartDrop, handleVote, joinPlayer, leavePlayerBySocket} from "../memory/rooms";

const playerJoinQuery = t.Object({
  code: t.String(),
  name: t.String(),
  emoji: t.Optional(t.Number()),
});

export const playerWsRoute = new Elysia().ws("/player", {
  query: playerJoinQuery,
  open(ws) {
    const {code, name, emoji} = ws.data.query;
    //@ts-ignore
    const player = joinPlayer(code, name, emoji ?? null, ws.raw);
    if (!player) {
      ws.close(1008, "Room not found");
    }
  },
  close(ws) {
    //@ts-ignore
    leavePlayerBySocket(ws.raw);
  },
  message(ws, message) {
    try {
      const raw =
        typeof message === "string"
          ? message
          : message instanceof Uint8Array
            ? Buffer.from(message).toString()
            : JSON.stringify(message);
      console.log("[ws] player message", raw);
      const parsed = JSON.parse(raw) as {
        messageType?: string;
        id?: string;
        x?: number;
        y?: number;
        targetPlayerId?: number;
      };
      if (parsed.messageType === "partdrop" && parsed.id) {
        //@ts-ignore
        handlePlayerPartDrop(ws.raw, {
          id: parsed.id,
          x: Number(parsed.x) || 0,
          y: Number(parsed.y) || 0,
        });
      }
      if (parsed.messageType === "vote" && parsed.targetPlayerId != null) {
        //@ts-ignore
        handleVote(ws.raw, {targetPlayerId: Number(parsed.targetPlayerId)});
      }
    } catch {
      // Ignore malformed messages.
    }
  },
});
