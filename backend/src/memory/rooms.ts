import {Host, Phase, Room, RoomSettings} from "../types/room";
import {generateRoomCode} from "../utils/roomCode";


export const rooms = new Map<string, Room>()
const ROOM_TTL_MS = 30 * 60 * 1000;
const ROOM_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const phaseTimers = new Map<string, ReturnType<typeof setTimeout>>();
const PHASE_ORDER: Phase[] = ["join", "preview", "build", "vote", "results"];
const MASKS = ["mask1.png", "mask2.png", "mask3.png"];
export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  previewTimeSec: 7,
  buildTimeSec: 20,
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
    placements: [],
  };
  room.players.push(player);
  sendPhaseStateToPlayer(room, player);
  sendPartLimitToPlayer(room, player);
  broadcastPlayerCount(room);
  console.log("[rooms] player joined", {code, playerId: player.id});
  return player;
};

export const broadcastPhaseChange = (
  room: Room,
  phase: Phase,
  countdownSec: number | null,
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

export const sendPartLimitToPlayer = (
  room: Room,
  player: Room["players"][number],
) => {
  const payload = JSON.stringify({
    messageType: "partlimit",
    limit: room.settings.partsPerPlayer,
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

export const broadcastMaskSelection = (room: Room, mask: string) => {
  const payload = JSON.stringify({
    messageType: "maskselected",
    mask,
  });
  room.host?.socket.send(payload);
  for (const player of room.players) {
    if (player.connected) {
      player.socket.send(payload);
    }
  }
};

export const broadcastVoteGallery = (room: Room) => {
  const entries = room.players.map((player) => ({
    playerId: player.id,
    name: player.name,
    emoji: player.emoji,
    placements: player.placements,
  }));
  lastVoteGallery.set(room.code, {mask: room.maskId, entries});
  const payload = JSON.stringify({
    messageType: "votegallery",
    mask: room.maskId,
    entries,
  });
  room.host?.socket.send(payload);
  for (const player of room.players) {
    if (player.connected) {
      player.socket.send(payload);
    }
  }
};

const voteCounts = new Map<string, Map<number, number>>();
const voterSelections = new Map<string, Map<number, number>>();
const lastVoteGallery = new Map<
  string,
  {
    mask: string | null;
    entries: {
      playerId: number;
      name: string;
      emoji: number | null;
      placements: {id: string; x: number; y: number}[];
    }[];
  }
>();

export const handleVote = (
  socket: Host["socket"],
  payload: {targetPlayerId: number},
) => {
  for (const room of rooms.values()) {
    const voter = room.players.find((candidate) => candidate.socket === socket);
    if (!voter) {
      continue;
    }
    const targetId = payload.targetPlayerId;
    if (!room.players.some((player) => player.id === targetId)) {
      return;
    }
    const roomVotes = voteCounts.get(room.code) ?? new Map<number, number>();
    roomVotes.set(targetId, (roomVotes.get(targetId) ?? 0) + 1);
    console.log("[rooms] vote received", {
      code: room.code,
      voterId: voter.id,
      targetPlayerId: targetId,
      count: roomVotes.get(targetId) ?? 0,
    });
    voteCounts.set(room.code, roomVotes);
    voterSelections.set(room.code, new Map<number, number>());


    const broadcast: string = JSON.stringify({
      messageType: "voteupdate",
      targetPlayerId: targetId,
      count: roomVotes.get(targetId) ?? 0,
    });
    room.host?.socket.send(broadcast);
    for (const player of room.players) {
      if (player.connected) {
        player.socket.send(broadcast);
      }
    }
    return;
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

export const handlePlayerPartDrop = (
  socket: Host["socket"],
  payload: {id: string; x: number; y: number},
) => {
  for (const room of rooms.values()) {
    const player = room.players.find((candidate) => candidate.socket === socket);
    if (player) {
      player.placements.push({
        id: payload.id,
        x: payload.x,
        y: payload.y,
      });
      console.log("[rooms] part drop", {
        code: room.code,
        playerId: player.id,
        partId: payload.id,
        x: payload.x,
        y: payload.y,
      });
      return;
    }
  }
  console.log("[rooms] part drop ignored - no player for socket");
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
      return 0;
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
  broadcastPhaseChange(room, phase, durationSec > 0 ? durationSec : null);
  if (phase === "preview" && MASKS.length > 0) {
    const mask = MASKS[Math.floor(Math.random() * MASKS.length)];
    room.maskId = mask;
    broadcastMaskSelection(room, mask);
  }
  if (phase === "vote") {
    broadcastVoteGallery(room);
  }
  if (phase === "results") {
    const roomVotes = voteCounts.get(room.code) ?? new Map<number, number>();
    const gallery = lastVoteGallery.get(room.code);
    if (gallery && gallery.entries.length > 0) {
      let maxCount = -1;
      const contenders: (typeof gallery.entries)[number][] = [];
      for (const entry of gallery.entries) {
        const count = roomVotes.get(entry.playerId) ?? 0;
        if (count > maxCount) {
          maxCount = count;
          contenders.length = 0;
          contenders.push(entry);
        } else if (count === maxCount) {
          contenders.push(entry);
        }
      }
      const winnerEntry =
        contenders[Math.floor(Math.random() * contenders.length)];
      if (winnerEntry) {
        const payload = JSON.stringify({
          messageType: "results",
          mask: gallery.mask,
          winner: winnerEntry,
          votes: roomVotes.get(winnerEntry.playerId) ?? 0,
        });
        room.host?.socket.send(payload);
        for (const player of room.players) {
          if (player.connected) {
            player.socket.send(payload);
          }
        }
      }
    }
  }
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

const clearPhaseTimer = (room: Room) => {
  const existingTimer = phaseTimers.get(room.code);
  if (existingTimer) {
    clearTimeout(existingTimer);
    phaseTimers.delete(room.code);
  }
};

export const advanceFromJoinPhase = (hostSocket: Host["socket"]) => {
  for (const room of rooms.values()) {
    if (room.host?.socket !== hostSocket) {
      continue;
    }
    if (room.phase !== "join") {
      return;
    }
    clearPhaseTimer(room);
    startPhase(room, "preview");
    scheduleNextPhase(room);
    return;
  }
};
