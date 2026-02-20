"use client";

import React, { useEffect } from "react";
import ContentWrapper from "../../../../../../components/ContentWrapper";
import { useGame } from "../../../../../../contexts/GameContext";
import Button from "../../../../../../components/ui/Button";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { useSocket } from "../../../../../../contexts/SocketContext";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import ProfilePicture from "../../../../../../components/ProfilePicture";
import { GameSkeleton } from "../../../../../../components/ui/skeleton";

export default function GamePage() {
  const { gameId, players } = useGame();
  const { socket } = useSocket();
  const { dictionary } = useLanguage();

  useEffect(() => {
    if (!socket || gameId)
      return;
    
    if (!window.location.pathname.includes("/game/"))
      return;
    
    const gameIdFromUrl = window.location.pathname.split("/game/").pop();
    if (gameIdFromUrl) {
      socket.emit("get-game-info", { gameId: gameIdFromUrl });
    }
  }, [socket, gameId]);

  if (!gameId) {
    return (
      <ContentWrapper title={dictionary.game.title}>
        <GameSkeleton />
      </ContentWrapper>
    );
  }

  const shortenedGameId = `${gameId.slice(0, 4)}...${gameId.slice(-4)}`;

  const copyGameId = () => {
    if (!gameId)
      return;
    navigator.clipboard.writeText(gameId);
    toast.success(dictionary.game.gameIdCopied);
  };

  const leaveRoom = () => {
    if (!socket || !gameId)
      return;
    socket.emit("leave-room", { gameId: gameId });
  };

  const startGame = () => {
    if (!socket || !gameId)
      return;
    socket.emit("start-game", { gameId: gameId });
  };

  return (
    <ContentWrapper title={dictionary.game.title}>
      <div className="flex flex-col h-full">
        <div className="flex-wrap gap-2 flex items-center justify-between px-4 py-2 bg-black/20 border-b border-px border-white/10">
          <p className="flex items-center gap-1 text-sub-text font-mono text-sm">
            {dictionary.game.roomIdLabel}:{" "}
            <button
              onClick={copyGameId}
              className="flex items-center gap-2 text-white py-1 px-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors duration-200"
            >
              {shortenedGameId}
              <Copy className="size-3 text-white cursor-pointer transition-colors duration-200" />
            </button>
          </p>
          <Button variant="danger" onClick={leaveRoom}>
            {dictionary.game.leaveRoom}
          </Button>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4 p-4">
          {(() => {
            const cards = [];
            for (let i = 0; i < 4; i++) {
              const player = players[i];
              cards.push(
                <div
                  key={i}
                  className="bg-black/70 border border-px border-white/10 rounded-md p-2 flex flex-col items-center justify-center gap-2 min-h-[140px] h-full"
                >
                  {player ? (
                    <>
                      <ProfilePicture profilePictureUrl={player.profilePictureUrl} size={12} />
                      <p className="text-white font-medium">{player.username || "?"}</p>
                    </>
                  ) : (
                    <p className="text-white/60">...</p>
                  )}
                </div>
              );
            }
            return cards;
          })()}
        </div>
        <div className="flex justify-center p-2 border-t border-px border-white/10">
          <Button variant="primary" onClick={startGame} fullWidth={true}>
            {dictionary.game.startGame}
          </Button>
        </div>
      </div>
    </ContentWrapper>
  );
}
