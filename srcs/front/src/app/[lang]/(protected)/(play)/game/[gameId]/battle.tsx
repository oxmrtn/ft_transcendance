import React from "react";
import ContentWrapper from "../../../../../../components/ContentWrapper";
import { Copy } from "lucide-react";
import Button from "../../../../../../components/ui/Button";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import { useGame } from "../../../../../../contexts/GameContext";
import { useSocket } from "../../../../../../contexts/SocketContext";

export default function Battle() {
  const { gameId } = useGame(); 
  const { socket } = useSocket();
  const { dictionary } = useLanguage();

  const shortenedGameId = `${gameId.slice(0, 4)}...${gameId.slice(-4)}`;

  const leaveGame = () => {
    if (!socket || !gameId)
      return;
    socket.emit("leave-game");
  };

  return (
    <ContentWrapper title={dictionary.game.title}>
      <div className="flex flex-col h-full">
        <div className="flex-wrap gap-2 flex items-center justify-between px-4 py-2 bg-black/20 border-b border-px border-white/10">
          <p className="flex items-center gap-1 text-sub-text font-mono text-sm">
          {dictionary.game.roomIdLabel}:
            <span className="text-white py-1 px-2">{shortenedGameId}</span>
          </p>
          <Button variant="danger" onClick={leaveGame}>
            {dictionary.game.abandonGame}
          </Button>
        </div>
      </div>
      <div className="flex-1"></div>
    </ContentWrapper>
  );
}