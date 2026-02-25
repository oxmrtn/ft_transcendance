"use client";

import Button from "../../../../../../components/ui/Button";
import ContentWrapper from "../../../../../../components/ContentWrapper";
import { useGame } from "../../../../../../contexts/GameContext";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";
import { useSocket } from "../../../../../../contexts/SocketContext";
import Trace from "./trace";
import { Loader2Icon } from "lucide-react";
import ProfilePicture from "../../../../../../components/ProfilePicture";
import StatusPastille, { type StatusPastilleVariant } from "../../../../../../components/StatusPastille";
import { cn } from "../../../../../../lib/utils";

export default function Scoreboard() {
    const { result, gameId, hasLeftRoomRef, gamePlayers, gameState } = useGame();
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
                <div className="flex-1 min-h-0 flex flex-col">
                    <TabsContent value="scoreboard" className="flex-1 min-h-0 w-full flex flex-col">
                        <div className="p-4">
                            <div className={cn("w-full flex items-center justify-center gap-3 py-6 rounded-md border border-px", result ? "bg-green/10 border-green/30" : "bg-destructive/10 border-destructive/30")}>
                                <p className="text-xl text-white font-medium font-mono">{result ? dictionary.game.youWon : dictionary.game.youFailed}</p>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col">
                            {(() => {
                                const rows = [];
                                const sortedPlayers = [...gamePlayers].sort((a, b) => {
                                    const rank = (p: typeof a) => {
                                        if (p.passedChallenge)
                                            return 0;
                                        if (p.passedChallenge === null)
                                            return 1;
                                        return 2;
                                    };
                                    return rank(a) - rank(b);
                                });

                                for (const [index, player] of sortedPlayers.entries()) {
                                    const status: { variant: StatusPastilleVariant; label: string } = player.passedChallenge === true
                                        ? { variant: "success", label: dictionary.game.successGame }
                                        : player.passedChallenge === null
                                        ? { variant: "inGame", label: dictionary.game.inGame }
                                        : { variant: "fail", label: dictionary.game.failedGame };
                                    rows.push(
                                        <div key={player.username} className="flex items-center justify-between py-4 px-4 hover:bg-white/5 transition-colors duration-200">
                                            <div className="flex items-center gap-8">
                                                <span className="text-sub-text font-mono">
                                                    {index + 1}.
                                                </span>
                                                <div className="flex items-center space-x-4">
                                                    <ProfilePicture profilePictureUrl={player.profilePictureUrl} size={12} />
                                                    <p className="font-mono text-semibold">{player.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <StatusPastille variant={status.variant} />
                                                <span className="text-sm text-muted-text">{status.label}</span>
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
                    <TabsContent value="trace" className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
                        <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-4">
                            <Trace />
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </ContentWrapper>
    );
}
