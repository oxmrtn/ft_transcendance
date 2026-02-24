"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { useSocket } from "./SocketContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export interface GamePlayer {
  username: string;
  profilePictureUrl: string | null;
  passedChallenge: boolean | null;
}

export type GameState = "waiting" | "playing" | "finished";
export type SubmitButtonState = "idle" | "waiting" | "timeout";

export const BASE_SUBMIT_TIMEOUT_SECONDS = 15;
export const BASE_REMAINING_TRIES = 3;

interface GameContextType {
  gameId: string | null;
  creatorUsername: string | null;
  roomPlayers: GamePlayer[];
  gamePlayers: GamePlayer[];
  isCreator: boolean;
  gameState: GameState;
  hasLeftRoomRef: React.RefObject<boolean>;
  submitState: SubmitButtonState;
  setSubmitState: (state: SubmitButtonState) => void;
  trace: { trace: string; result: boolean }[];
  setTrace: (trace: { trace: string; result: boolean }[]) => void;
  result: boolean | null;
  availableChallenges: string[];
  selectedChallenge: { name: string; description: string } | null;
  remainingTries: number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

function GameProvider({ children }: { children: ReactNode }) {
  const { username: myUsername } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const { lang, dictionary } = useLanguage();
  const [gameId, setGameId] = useState<string | null>(null);
  const [creatorUsername, setCreatorUsername] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [roomPlayers, setRoomPlayers] = useState<GamePlayer[]>([]);
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([]);
  const hasLeftRoomRef = useRef<boolean>(false);
  const prevGameStateRef = useRef<GameState>("waiting");
  const [submitState, setSubmitState] = useState<SubmitButtonState>("idle");
  const [trace, setTrace] = useState<{ trace: string; result: boolean }[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [availableChallenges, setAvailableChallenges] = useState<string[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<{ name: string; description: string } | null>(null);
  const [remainingTries, setRemainingTries] = useState<number>(0);

  const resetGame = () => {
    setGameId(null);
    setCreatorUsername(null);
    setGameState("waiting");
    setRoomPlayers([]);
    setGamePlayers([]);
    prevGameStateRef.current = "waiting";
    setIsCreator(false);
    setSubmitState("idle");
    setResult(null);
    setTrace([]);
    setAvailableChallenges([]);
    setSelectedChallenge(null);
    setRemainingTries(0);
  }

  const setGame = (payload: any) => {
    const nextState = payload.gameState as GameState;
    const wasWaiting = prevGameStateRef.current === "waiting";
    const isPlaying = nextState === "playing";
    const isFinished = nextState === "finished";

    if (isPlaying && wasWaiting) {
      setGamePlayers(payload.players ?? []);
    } else if ((isPlaying || isFinished) && prevGameStateRef.current === "playing") {
      setGamePlayers((prev) =>
        prev.map((gp) => {
          const inPayload = (payload.players ?? []).find((p: GamePlayer) => p.username === gp.username);
          if (inPayload) return inPayload;
          return { ...gp, passedChallenge: false };
        })
      );
    }

    prevGameStateRef.current = nextState;
    setGameId(payload.gameId);
    setCreatorUsername(payload.creatorUsername);
    setRoomPlayers(payload.players);
    setIsCreator(payload.creatorUsername === myUsername);
    setGameState(nextState);
    setSelectedChallenge(payload.selectedChallenge);
  }

  useEffect(() => {
    if (!socket || !lang)
      return;

    const onGameInfo = (payload: any) => {
      if (payload.event === "error") {
        toast.error(payload.message || dictionary.common.errorOccurred);
        return
      }

      if (payload.event === "room-kicked") {
        hasLeftRoomRef.current = true;
        resetGame();
        router.push(`/${lang}/`);
        toast.error(dictionary.game.roomKicked);
        return;
      }

      if (payload.event === "room-left") {
        resetGame();
        router.push(`/${lang}/`);
        return;
      }

      if (payload.event === "game-left") {
        setResult(false);
        return;
      }

      if (payload.event === "room-created"
        || payload.event === "room-joined"
      ) {
        setAvailableChallenges(payload.availableChallenges);
        hasLeftRoomRef.current = false;
        router.push(`/${lang}/game/${payload.gameId}`);
        setRemainingTries(BASE_REMAINING_TRIES);
        return;
      }

      if (payload.event === "room-update") {
        setGame(payload);
        return;
      }

      if (payload.event === "code-result") {
        setTrace(prev => [...prev, { trace: payload.trace, result: payload.result }]);
        if (payload.result || payload.remainingTries <= 0) {
          setResult(payload.result);
          return;
        }
        setSubmitState("timeout");
        setRemainingTries(payload.remainingTries);
      }
    };

    socket.on("game-info", onGameInfo);
    return () => {
      socket.off("game-info", onGameInfo);
    };
  }, [socket, lang, router, dictionary]);

  return (
    <GameContext.Provider value={{ gameId, creatorUsername, isCreator, roomPlayers, gamePlayers, gameState, hasLeftRoomRef, submitState, setSubmitState, trace, setTrace, result, availableChallenges, selectedChallenge, remainingTries }}>
      {children}
    </GameContext.Provider>
  );
}

function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

export {
  GameProvider,
  useGame
}
