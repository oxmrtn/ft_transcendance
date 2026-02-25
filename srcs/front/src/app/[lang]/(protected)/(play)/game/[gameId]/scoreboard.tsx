"use client";

import Button from "../../../../../../components/ui/Button";
import ContentWrapper from "../../../../../../components/ContentWrapper";
import { useGame } from "../../../../../../contexts/GameContext";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";
import { useSocket } from "../../../../../../contexts/SocketContext";
import Trace from "./trace";
import { Loader2Icon, EllipsisVertical, User, MessageCircleMore } from "lucide-react";
import ProfilePicture from "../../../../../../components/ProfilePicture";
import StatusDot, { type StatusDotVariant } from "../../../../../../components/StatusDot";
import { cn } from "../../../../../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../../../components/ui/dropdown-menu";
import { useModal } from "../../../../../../contexts/ModalContext";
import { ChatModal } from "../../../../../../components/Chat";
import ProfileModal from "../../../../../../components/ProfileModal";
import { useAuth } from "../../../../../../contexts/AuthContext";

export default function Scoreboard() {
    const { result, gameId, hasLeftRoomRef, gamePlayers, gameState } = useGame();
    const { dictionary } = useLanguage();
    const { socket } = useSocket();
    const { openModal } = useModal();
    const { username: myUsername } = useAuth();

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
                                    const status: { variant: StatusDotVariant; label: string } = player.passedChallenge === true
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
                                                <div className="flex items-center gap-2">
                                                    <ProfilePicture profilePictureUrl={player.profilePictureUrl} size={12} />
                                                    <p className="font-mono text-semibold">{player.username}</p>
                                                    {player.username !== myUsername && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger className="flex items-center justify-center p-1 bg-white/0 rounded-md hover:bg-white/10 cursor-pointer transition-colors duration-200">
                                                                <EllipsisVertical className="size-5 text-white" />
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className="mr-2 bg-white/5 backdrop-blur-xl border border-white/10">
                                                                <DropdownMenuItem className="hover:bg-white/10 gap-2.5" onClick={() => openModal(<ProfileModal username={player.username} />)}>
                                                                    <User className="h-4 w-4" />
                                                                    <span className="text-sm">{dictionary.profile.viewProfile}</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="hover:bg-white/10 gap-2.5"
                                                                    onClick={() => openModal(
                                                                        <ChatModal target={player.username} triggerId={Date.now()} />,
                                                                        { variant: 'chat', preventClose: true }
                                                                    )}
                                                                >
                                                                    <MessageCircleMore className="h-4 w-4" />
                                                                    <span className="text-sm">{dictionary.profile.sendMessage}</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <StatusDot variant={status.variant} />
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
                    <TabsContent value="trace" className="flex-1 min-h-0 w-full overflow-hidden">
                        <Trace />
                    </TabsContent>
                </div>
            </Tabs>
        </ContentWrapper>
    );
}
