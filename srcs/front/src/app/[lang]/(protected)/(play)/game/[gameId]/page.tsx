"use client";

import React, { useEffect } from "react";
import { useGame } from "../../../../../../contexts/GameContext";
import { useSocket } from "../../../../../../contexts/SocketContext";
import Room from "./room";
import Battle from "./battle";

export default function Game() {
  const { isInBattle, hasLeftRoomRef } = useGame();
  const { socket } = useSocket();

  useEffect(() => {
    return () => {
      if (socket && !hasLeftRoomRef.current)
        socket.emit("leave-room");
    };
  }, [socket]);

  return (
    <>{
      isInBattle ? <Battle /> : <Room />
    }</>
  );
}
