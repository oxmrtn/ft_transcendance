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
import type { UserType } from "../types";
import { useAuth } from "./AuthContext";

interface GameContextType {
  gameId: string | null;
  creatorUsername: string | null;
  isCreator: boolean;
  roomPlayers: UserType[];
  gamePlayers: UserType[];
  isStarted: boolean;
  isInBattle: boolean;
  hasLeftRoomRef: React.RefObject<boolean>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

function GameProvider({ children }: { children: ReactNode }) {
  const { username } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const { lang, dictionary } = useLanguage();
  const [gameId, setGameId] = useState<string | null>(null);
  const [creatorUsername, setCreatorUsername] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isInBattle, setIsInBattle] = useState<boolean>(false);
  const [roomPlayers, setRoomPlayers] = useState<UserType[]>([]);
  const [gamePlayers, setGamePlayers] = useState<UserType[]>([]);
  const hasLeftRoomRef = useRef<boolean>(false);

  const resetGame = () => {
    setGameId(null);
    setCreatorUsername(null);
    setIsStarted(false);
    setIsInBattle(false);
    setRoomPlayers([]);
    setGamePlayers([]);
    setIsCreator(false);
  }

  const setGame = (payload: any) => {
    setGameId(payload.gameId);
    setCreatorUsername(payload.creatorUsername);
    setRoomPlayers(payload.roomPlayers);
    setGamePlayers(payload.gamePlayers);
    setIsCreator(payload.creatorUsername === username);
  }

  useEffect(() => {
    if (!socket || !lang)
      return;

    const onGameInfo = (payload: any) => {
      console.log(payload);
      if (payload.event === "error") {
        toast.error(payload.message || dictionary.common.errorOccurred);
        return
      }

      if (payload.event === "room-kicked") {
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
        setIsInBattle(false);
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

      if (payload.event === "battle-started") {
        setIsStarted(true);
        setIsInBattle(true);
        return;
      }
    };

    socket.on("game-info", onGameInfo);
    return () => {
      socket.off("game-info", onGameInfo);
    };
  }, [socket, lang, router, dictionary]);

  return (
    <GameContext.Provider value={ { gameId, creatorUsername, isCreator, roomPlayers, gamePlayers, isStarted, isInBattle, hasLeftRoomRef } }>
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
