import {Host, Phase, Room, RoomSettings} from "../types/room";
import {generateRoomCode} from "../utils/roomCode";


export const rooms = new Map<string, Room>()
const ROOM_TTL_MS = 30 * 60 * 1000;
const ROOM_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const phaseTimers = new Map<string, ReturnType<typeof setTimeout>>();
const PHASE_ORDER: Phase[] = ["join", "preview", "build", "vote", "results"];

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  joinTimeSec: 30,
  previewTimeSec: 10,
  buildTimeSec: 60,
  voteTimeSec: 20,
  partsPerPlayer: 5,
};

export const createRoom: (settings: RoomSettings) => Room = (settings) => {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }
  const createdAt = Date.now();
  const room: Room = {
    code,
    createdAt,
    phase: "join",
    phaseEndsAt: null,
    maskId: null,
    settings,
    players: [],
    host: null,
  };
  rooms.set(code, room);
  console.log("[rooms] created", {code});
  return room;
}

export const joinHost = (code: string, host: Host): Room | null => {
  const room = rooms.get(code);
  if (!room) {
    console.log("[rooms] host join failed - not found", {code});
    return null;
  }
  room.host = host;
  startPhase(room, "join");
  scheduleNextPhase(room);
  broadcastPlayerCount(room);
  console.log("[rooms] host joined", {code});
  return room;
};

export const joinPlayer = (
  code: string,
  name: string,
  emoji: number | null,
  socket: Host["socket"],
) => {
  const room = rooms.get(code);
  if (!room) {
    console.log("[rooms] player join failed - not found", {code, name});
    return null;
  }
  const nextId =
    room.players.length === 0
      ? 1
      : Math.max(...room.players.map((player) => player.id)) + 1;
  const player = {
    id: nextId,
    name,
    emoji,
    connected: true,
    socket,
  };
  room.players.push(player);
  sendPhaseStateToPlayer(room, player);
  broadcastPlayerCount(room);
  console.log("[rooms] player joined", {code, playerId: player.id});
  return player;
};

export const broadcastPhaseChange = (
  room: Room,
  phase: Phase,
  countdownSec: number,
) => {
  const payload = JSON.stringify({
    messageType: "phasechange",
    phase,
    countdownSec,
  });
  room.host?.socket.send(payload);
  for (const player of room.players) {
    if (player.connected) {
      player.socket.send(payload);
    }
  }
};

export const sendPhaseStateToPlayer = (room: Room, player: Room["players"][number]) => {
  const remainingSec =
    room.phaseEndsAt !== null
      ? Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000))
      : null;
  const payload = JSON.stringify({
    messageType: "phasechange",
    phase: room.phase,
    countdownSec: remainingSec,
  });
  player.socket.send(payload);
};

export const broadcastPlayerCount = (room: Room) => {
  const connectedCount = room.players.filter((player) => player.connected).length;
  const payload = JSON.stringify({
    messageType: "playercount",
    count: connectedCount,
  });
  room.host?.socket.send(payload);
  for (const player of room.players) {
    if (player.connected) {
      player.socket.send(payload);
    }
  }
};

export const leavePlayerBySocket = (socket: Host["socket"]) => {
  for (const room of rooms.values()) {
    const player = room.players.find((candidate) => candidate.socket === socket);
    if (player && player.connected) {
      player.connected = false;
      broadcastPlayerCount(room);
      return;
    }
  }
};

const cleanupExpiredRooms = () => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.createdAt >= ROOM_TTL_MS) {
      const timer = phaseTimers.get(code);
      if (timer) {
        clearTimeout(timer);
        phaseTimers.delete(code);
      }
      rooms.delete(code);
    }
  }
};

setInterval(cleanupExpiredRooms, ROOM_CLEANUP_INTERVAL_MS);

const getPhaseDurationSec = (room: Room, phase: Phase) => {
  switch (phase) {
    case "join":
      return room.settings.joinTimeSec;
    case "preview":
      return room.settings.previewTimeSec;
    case "build":
      return room.settings.buildTimeSec;
    case "vote":
      return room.settings.voteTimeSec;
    case "results":
      return 0;
  }
};

const startPhase = (room: Room, phase: Phase) => {
  room.phase = phase;
  const durationSec = getPhaseDurationSec(room, phase);
  room.phaseEndsAt =
    durationSec > 0 ? Date.now() + durationSec * 1000 : null;
  broadcastPhaseChange(room, phase, durationSec);
};

const scheduleNextPhase = (room: Room) => {
  const currentIndex = PHASE_ORDER.indexOf(room.phase);
  const nextPhase = PHASE_ORDER[currentIndex + 1] ?? null;
  if (!nextPhase) {
    return;
  }
  const durationSec = getPhaseDurationSec(room, room.phase);
  if (durationSec <= 0) {
    startPhase(room, nextPhase);
    scheduleNextPhase(room);
    return;
  }
  const existingTimer = phaseTimers.get(room.code);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  const timer = setTimeout(() => {
    phaseTimers.delete(room.code);
    startPhase(room, nextPhase);
    scheduleNextPhase(room);
  }, durationSec * 1000);
  phaseTimers.set(room.code, timer);
};
