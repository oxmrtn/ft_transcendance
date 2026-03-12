"use client";

import React, { useEffect, useState } from "react";
import { useGame } from "../../../../../../contexts/GameContext";
import Room from "./room";
import Battle from "./battle";
import Scoreboard from "./scoreboard";
import ContentWrapper from "../../../../../../components/ContentWrapper";
import { GameSkeleton } from "../../../../../../components/ui/skeleton";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useSocket } from "../../../../../../contexts/SocketContext";

export default function Game() {
  const { result, gameState, isLoading, gameId, hasLeftRoomRef } = useGame();
  const { dictionary, lang } = useLanguage();
  const [showSkeleton, setShowSkeleton] = useState<boolean>(isLoading);
  const router = useRouter();
  const { socket } = useSocket();

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
      return;
    }
    const id = setTimeout(() => setShowSkeleton(false), 500);
    return () => clearTimeout(id);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !gameId)
      router.push(`/${lang}/`);
  }, [isLoading, gameId, router, lang]);

  useEffect(() => {
    return () => {
      if (!socket || !gameId || hasLeftRoomRef.current || gameState !== "waiting")
        return;
      socket.emit("leave-room");
    };
  }, [socket, hasLeftRoomRef, gameId, gameState]);

  if (showSkeleton || !gameId) {
    return (
      <ContentWrapper title={dictionary.game.gameTitle}>
        <GameSkeleton />
      </ContentWrapper>
    );
  }

  return (
    <>
      {result !== null ? <Scoreboard /> : gameState === "playing" ? <Battle /> : <Room />}
    </>
  );
}
