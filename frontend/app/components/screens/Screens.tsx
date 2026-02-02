import LoadingScreen from "@/app/components/screens/LoadingScreen";
import {ScreenState} from "@/app/components/screens/screenState";
import {useEffect, useMemo, useRef, useState} from "react";
import HomeScreen from "@/app/components/screens/HomeScreen";
import HostRoom from "@/app/components/screens/host/HostRoom";
import {useSearchParams} from "next/navigation";
import HostWaitingRoom from "@/app/components/screens/host/HostWaitingRoom";
import HostPreviewRoom from "@/app/components/screens/host/HostPreviewRoom";
import HostBuildRoom from "@/app/components/screens/host/HostBuildRoom";
import HostVoteRoom from "@/app/components/screens/host/HostVoteRoom";
import HostResultsRoom from "@/app/components/screens/host/HostResultsRoom";
import PlayerCreateRoom from "@/app/components/screens/player/PlayerCreateRoom";
import PlayerSettingsRoom from "@/app/components/screens/player/PlayerSettingsRoom";
import PlayerWaitingRoom from "@/app/components/screens/player/PlayerWaitingRoom";
import PlayerPreviewRoom from "@/app/components/screens/player/PlayerPreviewRoom";
import PlayerBuildRoom from "@/app/components/screens/player/PlayerBuildRoom";
import PlayerVoteRoom from "@/app/components/screens/player/PlayerVoteRoom";
import PlayerResultsRoom from "@/app/components/screens/player/PlayerResultsRoom";
import {treaty} from "@elysiajs/eden";
import type {App} from "../../../../backend/src";


export function Screens() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";
  const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? "ws://localhost:3001";
  //@ts-ignore
  const api = treaty<App>(API_BASE);

  const searchParams = useSearchParams();
  const injectedRoomCode = useMemo(
    () => searchParams.get("roomCode") ?? undefined,
    [searchParams],
  );
  const [screen, setScreen] = useState<ScreenState>("loading");
  const [roomCode, setRoomCode] = useState<string | undefined>(injectedRoomCode)
  const [playerCount, setPlayerCount] = useState<number>(0)
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [mask, setMask] = useState<string | null>(null);
  const [voteEntries, setVoteEntries] = useState<
    {
      playerId: number;
      name: string;
      emoji: number | null;
      placements: {id: string; x: number; y: number}[];
    }[]
  >([]);
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
  const [resultsWinner, setResultsWinner] = useState<{
    playerId: number;
    name: string;
    emoji: number | null;
    placements: {id: string; x: number; y: number}[];
  } | null>(null);
  const [resultsVotes, setResultsVotes] = useState<number | null>(null);
  const [showMaskOnVote, setShowMaskOnVote] = useState(false);
  const [partLimit, setPartLimit] = useState<number | null>(null);
  const [likedTargets, setLikedTargets] = useState<Record<number, boolean>>({});
  const [playerName, setPlayerName] = useState("");
  const [playerEmoji, setPlayerEmoji] = useState<string>("");
  const [playerStatus, setPlayerStatus] = useState("Idle");
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    if (injectedRoomCode && !roomCode) {
      setRoomCode(injectedRoomCode);
    }
  }, [injectedRoomCode, roomCode]);

  useEffect(() => {
    if (injectedRoomCode && screen === "home") {
      transitionScreen("playerJoin");
    }
  }, [injectedRoomCode, screen]);

  useEffect(() => {
    if (countdownSec === null) {
      return;
    }
    if (countdownTimer.current) {
      window.clearInterval(countdownTimer.current);
    }
    if (countdownSec <= 0) {
      return;
    }
    countdownTimer.current = window.setInterval(() => {
      setCountdownSec((value) => (value ? Math.max(value - 1, 0) : 0));
    }, 1000);
    return () => {
      if (countdownTimer.current) {
        window.clearInterval(countdownTimer.current);
      }
    };
  }, [countdownSec]);

  const [transitionState, setTransitionState] = useState<
    "idle" | "cover" | "reveal"
  >("idle");

  const hostSocketRef = useRef<WebSocket | null>(null);
  const playerSocketRef = useRef<WebSocket | null>(null);
  const countdownTimer = useRef<number | null>(null);
  const flowRef = useRef<null | "host" | "player">(null);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const readyResolver = useRef<null | (() => void)>(null);

  const waitForNextScreenReady = () =>
    new Promise<void>((resolve) => {
      readyResolver.current = () => {
        readyResolver.current = null;
        resolve();
      };
    });

  const onHostMessage = (event: any) => {
      if (flowRef.current !== "host") {
        return;
      }
      try {
        const message = JSON.parse(String(event.data));
        if (message?.messageType === "playercount") {
          setPlayerCount(Number(message.count) || 0);
        }
        if (message?.messageType === "phasechange") {
          if(typeof message.phase === "string") {
            if(message.phase === "join") {
              transitionScreen("hostWaitingRoom")
              setMask(null);
              setVoteEntries([]);
              setVoteCounts({});
              setResultsWinner(null);
              setResultsVotes(null);
              setShowMaskOnVote(false);
            } else if (message.phase === "preview") {
              transitionScreen("hostPreview")
            } else if (message.phase === "build") {
              transitionScreen("hostBuild")
            } else if (message.phase === "vote") {
              transitionScreen("hostVote")
            } else if (message.phase === "results") {
              transitionScreen("hostResults")
            }
          }
          setCountdownSec(
            typeof message.countdownSec === "number"
              ? message.countdownSec
              : null,
          );
        }
        if (message?.messageType === "maskselected") {
          setMask(typeof message.mask === "string" ? message.mask : null);
        }
        if (message?.messageType === "votegallery") {
          setVoteEntries(Array.isArray(message.entries) ? message.entries : []);
          setVoteCounts({});
          if (typeof message.mask === "string") {
            setMask(message.mask);
          }
          if (typeof message.showMaskOnVote === "boolean") {
            setShowMaskOnVote(message.showMaskOnVote);
          } else {
            setShowMaskOnVote(false);
          }
        }
        if (message?.messageType === "voteupdate") {
          if (typeof message.targetPlayerId === "number") {
            setVoteCounts((prev) => ({
              ...prev,
              [message.targetPlayerId]: Number(message.count) || 0,
            }));
          }
        }
        if (message?.messageType === "results") {
          if (message.winner) {
            setResultsWinner(message.winner);
          }
          if (typeof message.votes === "number") {
            setResultsVotes(message.votes);
          } else {
            setResultsVotes(null);
          }
          if (typeof message.mask === "string") {
            setMask(message.mask);
          }
        }
      } catch {
        // Ignore non-JSON messages.
      }
    }

  const onPlayerMessage = (event: any) => {
    if (flowRef.current !== "player") {
      return;
    }
    try {
      const message = JSON.parse(String(event.data));
      if (message?.messageType === "playercount") {
        setPlayerCount(Number(message.count) || 0);
      }
      if (message?.messageType === "phasechange") {
        if (typeof message.phase === "string") {
          if (message.phase === "join") {
            transitionScreen("playerWaitingRoom");
            setMask(null);
            setVoteEntries([]);
            setVoteCounts({});
            setLikedTargets({});
            setResultsWinner(null);
            setResultsVotes(null);
            setShowMaskOnVote(false);
          } else if (message.phase === "preview") {
            transitionScreen("playerPreview");
          } else if (message.phase === "build") {
            transitionScreen("playerBuild");
          } else if (message.phase === "vote") {
            transitionScreen("playerVote");
          } else if (message.phase === "results") {
            transitionScreen("playerResults");
          }
        }
        setCountdownSec(
          typeof message.countdownSec === "number"
            ? message.countdownSec
            : null,
        );
      }
      if (message?.messageType === "maskselected") {
        setMask(typeof message.mask === "string" ? message.mask : null);
      }
      if (message?.messageType === "partlimit") {
        setPartLimit(typeof message.limit === "number" ? message.limit : null);
      }
      if (message?.messageType === "votegallery") {
        setVoteEntries(Array.isArray(message.entries) ? message.entries : []);
        setLikedTargets({});
        if (typeof message.mask === "string") {
          setMask(message.mask);
        }
        if (typeof message.showMaskOnVote === "boolean") {
          setShowMaskOnVote(message.showMaskOnVote);
        } else {
          setShowMaskOnVote(false);
        }
      }
      if (message?.messageType === "voteupdate") {
        if (typeof message.targetPlayerId === "number") {
          setVoteCounts((prev) => ({
            ...prev,
            [message.targetPlayerId]: Number(message.count) || 0,
          }));
        }
      }
      if (message?.messageType === "results") {
        if (message.winner) {
          setResultsWinner(message.winner);
        }
        if (typeof message.mask === "string") {
          setMask(message.mask);
        }
      }
    } catch {
      // Ignore non-JSON messages.
    }
  };

  const connectHostSocketForPlayer = (code: string) => {
    hostSocketRef.current?.close();
    const socket = new WebSocket(`${WS_BASE}/host?code=${code.trim()}`);
    hostSocketRef.current = socket;
    socket.addEventListener("message", onHostMessage);
  };

  const connectPlayerSocket = () => {
    setPlayerError(null);
    if (!roomCode?.trim() || !playerName.trim() || !playerEmoji) {
      setPlayerError("Please enter name and pick an emoji.");
      return;
    }
    setPlayerStatus("Connecting...");
    const emojiCode = playerEmoji.codePointAt(0);
    const query = new URLSearchParams({
      code: roomCode.trim().toUpperCase(),
      name: playerName.trim(),
      emoji: emojiCode ? String(emojiCode) : "",
    });
    const socket = new WebSocket(`${WS_BASE}/player?${query.toString()}`);
    playerSocketRef.current = socket;
    socket.addEventListener("open", () => {
      setPlayerStatus("Connected");
      transitionScreen("playerWaitingRoom");
    });
    socket.addEventListener("close", () => setPlayerStatus("Disconnected"));
    socket.addEventListener("error", () => setPlayerError("Socket error"));
    socket.addEventListener("message", onPlayerMessage);
  };

  const handleStartGame = () => {
    const socket = hostSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(JSON.stringify({messageType: "start"}));
  };

  const handleRestartGame = () => {
    const socket = hostSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(JSON.stringify({messageType: "restart"}));
  };

  const handleCreatePlayerRoom = async (settings: {
    previewTimeSec: number;
    buildTimeSec: number;
    voteTimeSec: number;
    partsPerPlayer: number;
    showMaskOnVote: boolean;
  }) => {
    setIsCreatingRoom(true);
    setPlayerError(null);
    try {
      const {data, error} = await api.rooms.post(settings);
      if (error || !data) {
        throw new Error("Create room failed");
      }
      setRoomCode(data.code);
      connectHostSocketForPlayer(data.code);
      transitionScreen("playerJoin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setPlayerError(message);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleScreenReady = () => {
    readyResolver.current?.();
  };

  const transitionScreen = async(nextScreen: ScreenState) => {
    setTransitionState("cover");
    await delay(200)
    const shouldWaitForReady = nextScreen !== screen;
    const readyPromise = shouldWaitForReady ? waitForNextScreenReady() : Promise.resolve();
    if (nextScreen.startsWith("host")) {
      flowRef.current = "host";
    } else if (nextScreen.startsWith("player")) {
      flowRef.current = "player";
    } else {
      flowRef.current = null;
    }
    setScreen(nextScreen)
    await readyPromise;
    await delay(100)
    setTransitionState("reveal")
    await delay(300)
    setTransitionState("idle")
  }

  return (
    <>
      <div
        className={`screen-wipe ${
          transitionState === "cover"
            ? "screen-wipe--cover"
            : transitionState === "reveal"
              ? "screen-wipe--reveal"
              : ""
        }`}
        aria-hidden="true"
      />
    {
      screen === "loading" && (
        <LoadingScreen setScreen={transitionScreen} onReady={handleScreenReady}/>
      )
    }
    {
      screen === "home" && (
        <HomeScreen setScreen={transitionScreen} onReady={handleScreenReady}/>
      )
    }
    {
      screen === "hostRoom" && (
        <HostRoom
          setScreen={transitionScreen}
          onReady={handleScreenReady}
          hostSocketRef={hostSocketRef}
          setRoomCode={setRoomCode}
          onHostMessage={onHostMessage}
        />
      )
    }
    {
      screen === "hostWaitingRoom" && (
        <HostWaitingRoom
          onReady={handleScreenReady}
          roomCode={roomCode}
          playerCount={playerCount}
          onStart={handleStartGame}
        />
      )
    }
    {
      screen === "playerCreate" && (
        <PlayerCreateRoom
          onReady={handleScreenReady}
          onCreate={handleCreatePlayerRoom}
          isCreating={isCreatingRoom}
          onBack={() => transitionScreen("home")}
        />
      )
    }
    {
      screen === "playerJoin" && (
        <PlayerSettingsRoom
          onReady={handleScreenReady}
          roomCode={roomCode}
          showRoomCode={!roomCode}
          name={playerName}
          emoji={playerEmoji}
          status={playerStatus}
          error={playerError}
          onBack={() => transitionScreen("home")}
          onRoomCodeChange={(value) => setRoomCode(value.toUpperCase())}
          onNameChange={setPlayerName}
          onEmojiChange={(value) => {
            setPlayerEmoji(value);
          }}
          onJoin={connectPlayerSocket}
        />
      )
    }
    {
      screen === "playerWaitingRoom" && (
        <PlayerWaitingRoom
          onReady={handleScreenReady}
          roomCode={roomCode}
          playerCount={playerCount}
          joinUrl={
            roomCode
              ? `${typeof window !== "undefined" ? window.location.origin : ""}?roomCode=${roomCode}`
              : null
          }
          canStart={hostSocketRef.current?.readyState === WebSocket.OPEN}
          onStart={handleStartGame}
        />
      )
    }
    {
      screen === "playerPreview" && (
        <PlayerPreviewRoom
          onReady={handleScreenReady}
          mask={mask}
          countdownSec={countdownSec}
          playerCount={playerCount}
        />
      )
    }
    {
      screen === "playerBuild" && (
        <PlayerBuildRoom
          onReady={handleScreenReady}
          mask={mask}
          partLimit={partLimit}
          countdownSec={countdownSec}
          onPartDrop={(partId, xPercent, yPercent) => {
            playerSocketRef.current?.send(
              JSON.stringify({
                messageType: "partdrop",
                id: partId,
                x: xPercent,
                y: yPercent,
              }),
            );
          }}
        />
      )
    }
    {
      screen === "playerVote" && (
        <PlayerVoteRoom
          onReady={handleScreenReady}
          mask={mask}
          entries={voteEntries}
          counts={voteCounts}
          likedTargets={likedTargets}
          countdownSec={countdownSec}
          showMaskOnVote={showMaskOnVote}
          onVote={(targetPlayerId) => {
            if (likedTargets[targetPlayerId]) {
              return;
            }
            setLikedTargets((prev) => ({
              ...prev,
              [targetPlayerId]: true,
            }));
            setVoteCounts((prev) => ({
              ...prev,
              [targetPlayerId]: (prev[targetPlayerId] ?? 0) + 1,
            }));
            playerSocketRef.current?.send(
              JSON.stringify({
                messageType: "vote",
                targetPlayerId,
              }),
            );
          }}
        />
      )
    }
    {
      screen === "playerResults" && (
        <PlayerResultsRoom
          onReady={handleScreenReady}
          mask={mask}
          winner={resultsWinner}
          canRestart={hostSocketRef.current?.readyState === WebSocket.OPEN}
          onRestart={handleRestartGame}
        />
      )
    }
    {
      screen === "hostPreview" && (
        <HostPreviewRoom
          onReady={handleScreenReady}
          mask={mask}
          countdownSec={countdownSec}
        />
      )
    }
    {
      screen === "hostBuild" && (
        <HostBuildRoom
          onReady={handleScreenReady}
          countdownSec={countdownSec}
        />
      )
    }
    {
      screen === "hostVote" && (
        <HostVoteRoom
          onReady={handleScreenReady}
          mask={mask}
          entries={voteEntries}
          counts={voteCounts}
          countdownSec={countdownSec}
          showMaskOnVote={showMaskOnVote}
        />
      )
    }
    {
      screen === "hostResults" && (
        <HostResultsRoom
          onReady={handleScreenReady}
          mask={mask}
          winner={resultsWinner}
          votes={resultsVotes}
          onRestart={handleRestartGame}
        />
      )
    }
</>  )
}
