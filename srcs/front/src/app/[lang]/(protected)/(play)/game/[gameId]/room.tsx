"use client";

import React, { useEffect, useState } from "react";
import ContentWrapper from "../../../../../../components/ContentWrapper";
import { useGame } from "../../../../../../contexts/GameContext";
import Button from "../../../../../../components/ui/Button";
import { toast } from "sonner";
import { Copy, Crown, Heart, Loader2Icon, Skull, X } from "lucide-react";
import { useSocket } from "../../../../../../contexts/SocketContext";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import ProfilePicture from "../../../../../../components/ProfilePicture";
import { GameSkeleton } from "../../../../../../components/ui/skeleton";
import { useAuth } from "../../../../../../contexts/AuthContext";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../../../../../components/ui/Select";

export default function Room() {
  const { username: myUsername } = useAuth();
  const { gameId, creatorUsername, isCreator, roomPlayers, hasLeftRoomRef, availableChallenges } = useGame();
  const { socket } = useSocket();
  const { dictionary } = useLanguage();
  const [selectedChallenge, setSelectedChallenge] = useState<string | null | undefined>(undefined);

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
      <ContentWrapper title={dictionary.game.roomTitle}>
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
    hasLeftRoomRef.current = true;
    socket.emit("leave-room");
  };

  const startGame = () => {
    if (!socket || !gameId)
      return;
    console.log(selectedChallenge);
    socket.emit("start-game", { challengeName: selectedChallenge || "" });
  };

  const kickPlayer = (targetUsername: string) => {
    if (!socket)
      return;
    socket.emit("kick-player", { targetUsername });
  };

  return (
    <ContentWrapper title={`${dictionary.game.roomTitle} - ${shortenedGameId}`}>
      <div className="flex flex-col h-full">
        <div className="flex-wrap gap-2 flex items-center justify-between px-4 py-2 bg-black/20 border-b border-px border-white/10">
          <p className="flex items-center gap-1 text-sub-text font-mono text-sm">
            {dictionary.game.roomIdLabel}:
            <button
              onClick={copyGameId}
              className="flex items-center gap-2 text-white py-1 px-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors duration-200"
            >
              {shortenedGameId}
              <Copy className="size-3 text-white cursor-pointer" />
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
              const player = roomPlayers[i];
              cards.push(
                <div
                  key={i}
                  className="bg-black/50 border border-px border-white/10 rounded-md p-2 flex flex-col items-center justify-center gap-2 min-h-[140px] h-full relative"
                >
                  {player ? (
                      <>
                        <ProfilePicture profilePictureUrl={player.profilePictureUrl} size={12} />
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{player.username || "?"}</p>
                          {creatorUsername === player.username && (
                            <Crown className="size-4 text-yellow-500" fill="currentColor" />
                          )}
                        </div>
                        {isCreator && player.username !== myUsername && (
                          <button className="flex items-center justify-center p-1 bg-white/0 rounded-md hover:bg-destructive/20 cursor-pointer transition-colors duration-200 absolute top-2 right-2">
                            <X className="size-5 text-destructive" onClick={() => kickPlayer(player.username)} />
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-white/60">...</p>
                    )
                  }
                </div>
              );
            }
            return cards;
          })()}
        </div>
        <div className="px-4 py-2 border-t border-px border-white/10">
          {isCreator && availableChallenges && availableChallenges.length > 0 ? (
            <div className="flex gap-4">
              <Select onValueChange={setSelectedChallenge} required={true}>
                <SelectTrigger className="!h-full">
                  <SelectValue placeholder={dictionary.game.selectChallenge} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{dictionary.game.selectChallenge}</SelectLabel>
                    {availableChallenges.map((challenge) => (
                      <SelectItem key={challenge} value={challenge}>{challenge}</SelectItem>
                    ))}
                    <SelectItem value={null}>{dictionary.game.randomChallenge}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="primary" onClick={startGame} fullWidth={true} disabled={roomPlayers.length < 2 || selectedChallenge === undefined}>
                {dictionary.game.startGame}
              </Button>
            </div>
          ) : (
            <div className="flex justify-center items-center gap-2 py-2">
              <Loader2Icon className="size-5 animate-spin text-white/60" />
              <p className="text-white/60 text-sm">
                {dictionary.game.startingGame}
              </p>
            </div>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
}
