"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSocket } from "./SocketContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { toast } from "sonner";
import type { UserType } from "../types";

interface GameContextType {
  gameId: string | null;
  players: UserType[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

function GameProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const router = useRouter();
  const { lang, dictionary } = useLanguage();
  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<UserType[]>([]);

  useEffect(() => {
    if (!socket || !lang)
      return;

    const onGameInfo = (payload: any) => {
      console.log("payload: ", payload);
      if (payload.event === "error") {
        toast.error(payload.message || dictionary.common.errorOccurred);
        return
      }

      if (payload.event === "room-not-found") {
        router.push(`/${lang}/`);
        toast.error(payload.message || dictionary.common.errorOccurred);
        return;
      }

      if (payload.event === "room-left") {
        router.push(`/${lang}/`);
        setGameId(null);
        setPlayers([]);
        return;
      }

      if (payload.event === "room-created"
        || payload.event === "room-joined"
      ) {
        setGameId(payload.gameId);
        if (payload.roomPlayers)
          setPlayers(payload.roomPlayers);
        if (!window.location.pathname.includes(`/game/${payload.gameId}`))
          router.push(`/${lang}/game/${payload.gameId}`);
        return;
      }
    };

    socket.on("game-info", onGameInfo);
    return () => {
      socket.off("game-info", onGameInfo);
    };
  }, [socket, lang, router, dictionary]);

  return (
    <GameContext.Provider value={ { gameId, players } }>
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
