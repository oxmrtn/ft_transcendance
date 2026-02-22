"use client";

import React from "react";
import { useGame } from "../../../../../../contexts/GameContext";
import Room from "./room";
import Battle from "./battle";

export default function Game() {
  const { isStarted } = useGame();

  return (
    <>{
      isStarted ? <Battle /> : <Room />
    }</>
  );
}
