"use client";

import React, { useEffect } from "react";
import { useGame } from "../../../../../../contexts/GameContext";
import { useSocket } from "../../../../../../contexts/SocketContext";
import Room from "./room";
import Battle from "./battle";
import Scoreboard from "./scoreboard";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import { toast } from "sonner";

export default function Game() {
  const { result, gameState, hasLeftRoomRef, gameId, resetGame } = useGame();
  const { socket } = useSocket();
  const router = useRouter();
  const { dictionary, lang } = useLanguage();

  useEffect(() => {
    return () => {
      if (socket && !hasLeftRoomRef.current)
        socket.emit("leave-room");
    };
  }, [socket, hasLeftRoomRef]);

  useEffect(() => {
    if (gameId || hasLeftRoomRef.current)
      return;
    resetGame();
    router.replace(`/${lang}/`);
    toast.error(dictionary.game.gameDisconnected);
  }, [gameId, router, lang]);

  return (
    <>{
      result !== null ? <Scoreboard /> : gameState === "playing" ? <Battle /> : <Room />
    }</>
  );
}
