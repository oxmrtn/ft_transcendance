"use client";

import Button from "../../../../../../components/ui/Button";
import ContentWrapper from "../../../../../../components/ContentWrapper";
import { useGame } from "../../../../../../contexts/GameContext";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";
import { useSocket } from "../../../../../../contexts/SocketContext";
import Trace from "./trace";
import { cn } from "../../../../../../lib/utils";
import { Check, Heart, Loader2Icon, Skull } from "lucide-react";
import ProfilePicture from "../../../../../../components/ProfilePicture";

export default function Scoreboard() {
    const { result, gameId, hasLeftRoomRef, players, gameState } = useGame();
    const { dictionary } = useLanguage();
    const { socket } = useSocket();

    const shortenedGameId = `${gameId.slice(0, 4)}...${gameId.slice(-4)}`;

    const leaveRoom = () => {
        if (!socket || !gameId)
            return;
        hasLeftRoomRef.current = true;
        socket.emit("leave-room");
    };

    return (
        <ContentWrapper title={`${dictionary.game.scoreboardTitle} - ${shortenedGameId}`}>
            <Tabs defaultValue="scoreboard" className="h-full w-full flex flex-col">
                <div className="flex-wrap gap-2 flex items-center justify-between px-4 py-2 bg-black/20 border-b border-px border-white/10">
                    <TabsList className="flex gap-2">
                        <TabsTrigger value="scoreboard">
                            {dictionary.game.scoreboardTab}
                        </TabsTrigger>
                        <TabsTrigger value="trace">
                            {dictionary.game.traceTab}
                        </TabsTrigger>
                    </TabsList>
                    <Button variant="danger" onClick={leaveRoom}>
                        {dictionary.game.leaveGame}
                    </Button>
                </div>
                <div className="flex-1">
                    <TabsContent value="scoreboard" className="h-full w-full flex flex-col">
                        <div className="p-4">
                            <div className={cn("w-full flex items-center justify-center bg-white p-6 gap-2 rounded-md border border-px", result === true ? "bg-green/20 border-green/20" : "bg-destructive/20 border-destructive/20")}>
                                {result ? <Check className="size-4.5 text-green" />
                                    : <Skull className="size-7 text-destructive" />
                                }
                                <p className="text-xl text-white font-medium font-mono">{result ? dictionary.game.youWon : dictionary.game.youFailed}</p>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col divide-y divide-white/10">
                            {(() => {
                                const rows = [];
                                const sortedPlayers = [...players].sort((a, b) => {
                                    const rank = (p: typeof a) => {
                                        if (p.passedChallenge)
                                            return 0;
                                        if (p.passedChallenge === null && p.remainingTries > 0)
                                            return 1;
                                        return 2;
                                    };
                                    return rank(a) - rank(b);
                                });

                                for (const [index, player] of sortedPlayers.entries()) {
                                    rows.push(
                                        <div key={player.username} className="flex items-center justify-between py-2 px-4">
                                            <div className="flex items-center gap-8">
                                                <span className="text-sub-text font-mono">
                                                    {index + 1}.
                                                </span>
                                                <div className="flex items-center space-x-4">
                                                    <ProfilePicture profilePictureUrl={player.profilePictureUrl} size={12} />
                                                    <p className="font-mono text-semibold">{player.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {player.passedChallenge === true ? (
                                                    <>
                                                        <Check className="size-6 text-green" />
                                                        <span className="text-sub-text">
                                                            {dictionary.game.successGame}
                                                        </span>
                                                    </>
                                                ) : player.passedChallenge === null && player.remainingTries > 0 ? (
                                                    <>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-white font-mono">
                                                                {player.remainingTries}
                                                            </span>
                                                            <Heart className="size-6 text-pink-400" fill="currentColor" />
                                                        </div>
                                                        <span className="text-sub-text">
                                                            {dictionary.game.inGame}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Skull className="size-6 text-destructive/80" />
                                                        <span className="text-sub-text">
                                                            {dictionary.game.failedGame}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }

                                return rows;
                            })()}
                        </div>
                        <div className="flex justify-center items-center gap-2 p-4 border-t border-px border-white/10">
                            {gameState === "playing" ? (
                                <>
                                    <Loader2Icon className="size-5 animate-spin text-muted-text" />
                                    <p className="text-sub-text text-sm">
                                        {dictionary.game.waitingForResult}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sub-text text-sm">
                                        {dictionary.game.gameEnded}
                                    </p>
                                </>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="trace" className="h-full w-full p-4">
                        <Trace />
                    </TabsContent>
                </div>
            </Tabs>
        </ContentWrapper>
    );
}
