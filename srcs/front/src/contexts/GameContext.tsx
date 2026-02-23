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
  remainingTries: number;
}

export type GameState = "waiting" | "playing" | "finished";
export type SubmitButtonState = "idle" | "waiting" | "timeout";

export const BASE_SUBMIT_TIMEOUT_SECONDS = 15;
export const BASE_REMAINING_TRIES = 3;

interface GameContextType {
  gameId: string | null;
  creatorUsername: string | null;
  players: GamePlayer[];
  isCreator: boolean;
  gameState: GameState;
  hasLeftRoomRef: React.RefObject<boolean>;
  submitState: SubmitButtonState;
  setSubmitState: (state: SubmitButtonState) => void;
  trace: { trace: string; result: boolean }[];
  setTrace: (trace: { trace: string; result: boolean }[]) => void;
  result: boolean | null;
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
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const hasLeftRoomRef = useRef<boolean>(false);
  const [submitState, setSubmitState] = useState<SubmitButtonState>("idle");
  const [trace, setTrace] = useState<{ trace: string; result: boolean }[]>([]);
  const [result, setResult] = useState<boolean | null>(null);

  const resetGame = () => {
    setGameId(null);
    setCreatorUsername(null);
    setGameState("waiting");
    setPlayers([]);
    setIsCreator(false);
    setSubmitState("idle");
    setResult(null);
    setTrace([]);
  }

  const setGame = (payload: any) => {
    setGameId(payload.gameId);
    setCreatorUsername(payload.creatorUsername);
    setPlayers(payload.players);
    setIsCreator(payload.creatorUsername === myUsername);
    setGameState(payload.gameState);
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
        hasLeftRoomRef.current = false;
        router.push(`/${lang}/game/${payload.gameId}`);
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
      }
    };

    socket.on("game-info", onGameInfo);
    return () => {
      socket.off("game-info", onGameInfo);
    };
  }, [socket, lang, router, dictionary]);

  return (
    <GameContext.Provider value={{ gameId, creatorUsername, isCreator, players, gameState, hasLeftRoomRef, submitState, setSubmitState, trace, setTrace, result }}>
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
