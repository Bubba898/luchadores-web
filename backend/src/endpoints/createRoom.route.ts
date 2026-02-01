import {Elysia, t} from "elysia";
import {createRoom, DEFAULT_ROOM_SETTINGS} from "../memory/rooms";
import {RoomSettings} from "../types/room";

const createRoomBody = t.Object({
  joinTimeSec: t.Optional(t.Number()),
  previewTimeSec: t.Optional(t.Number()),
  buildTimeSec: t.Optional(t.Number()),
  voteTimeSec: t.Optional(t.Number()),
  partsPerPlayer: t.Optional(t.Number()),
});

export const createRoomRoute = new Elysia().post(
  "/rooms",
  ({body}) => {
    const settings: RoomSettings = {
      ...DEFAULT_ROOM_SETTINGS,
      ...(body ?? {}),
    };

    const room = createRoom(settings);
    return {code: room.code, settings: room.settings, phase: room.phase};
  },
  {
    body: createRoomBody,
  },
);
