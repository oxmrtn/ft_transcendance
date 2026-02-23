"use client";

import Button from "../../../../../../components/ui/Button";
import ContentWrapper from "../../../../../../components/ContentWrapper";
import { useGame } from "../../../../../../contexts/GameContext";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";
import { useSocket } from "../../../../../../contexts/SocketContext";
import Trace from "./trace";

export default function Scoreboard() {
    const { result, gameId, hasLeftRoomRef } = useGame();
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
                <div className="flex-1 p-4">
                    <TabsContent value="scoreboard" className="h-full w-full">
                        
                    </TabsContent>
                    <TabsContent value="trace" className="h-full w-full">
                        <Trace />
                    </TabsContent>
                </div>
            </Tabs>
        </ContentWrapper>
    );
}
