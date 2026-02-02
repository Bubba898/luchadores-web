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


export function Screens() {
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

  useEffect(() => {
    if (injectedRoomCode && !roomCode) {
      setRoomCode(injectedRoomCode);
    }
  }, [injectedRoomCode, roomCode]);

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
  const countdownTimer = useRef<number | null>(null);

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
      try {
        const message = JSON.parse(String(event.data));
        if (message?.messageType === "playercount") {
          setPlayerCount(Number(message.count) || 0);
        }
        if (message?.messageType === "phasechange") {
          if(typeof message.phase === "string") {
            if(message.phase === "join") {
              transitionScreen("hostWaitingRoom")
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

  const handleStartGame = () => {
    const socket = hostSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(JSON.stringify({messageType: "start"}));
  };

  const handleScreenReady = () => {
    readyResolver.current?.();
  };

  const transitionScreen = async(nextScreen: ScreenState) => {
    setTransitionState("cover");
    await delay(200)
    const shouldWaitForReady = nextScreen !== screen;
    const readyPromise = shouldWaitForReady ? waitForNextScreenReady() : Promise.resolve();
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
        />
      )
    }
</>  )
}
