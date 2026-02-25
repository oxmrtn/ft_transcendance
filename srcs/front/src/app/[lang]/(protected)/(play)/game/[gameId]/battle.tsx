import React, { useEffect, useRef, useState } from "react";
import ContentWrapper from "../../../../../../components/ContentWrapper";
import { Loader2Icon } from "lucide-react";
import Button from "../../../../../../components/ui/Button";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import { BASE_REMAINING_TRIES, BASE_SUBMIT_TIMEOUT_SECONDS, useGame } from "../../../../../../contexts/GameContext";
import { useSocket } from "../../../../../../contexts/SocketContext";
import { Editor } from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";
import ProfilePicture from "../../../../../../components/ProfilePicture";
import Trace from "./trace";
import { cn } from "../../../../../../lib/utils";
import { ScrollArea } from "../../../../../../components/ui/scroll-area";
import StatusDot from "../../../../../../components/StatusDot";

type BattleTab = "code" | "subject" | "trace";

export default function Battle() {
  const { trace, gameId, gamePlayers, submitState, setSubmitState, selectedChallenge, remainingTries } = useGame();
  const { socket } = useSocket();
  const { dictionary } = useLanguage();
  const [code, setCode] = useState("");
  const [timeoutSeconds, setTimeoutSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState<BattleTab>("code");
  const [traceNotification, setTraceNotification] = useState(false);
  const prevLengthRef = useRef(trace.length);

  const shortenedGameId = `${gameId.slice(0, 4)}...${gameId.slice(-4)}`;

  const leaveGame = () => {
    if (!socket || !gameId)
      return;
    socket.emit("leave-game");
  };

  const submitCode = () => {
    if (!socket || !gameId || submitState !== "idle" || !code || code.trim() === "")
      return;
    setSubmitState("waiting");
    socket.emit("code-submit", { code });
  };

  useEffect(() => {
    if (submitState !== "timeout")
      return;
  
    const penaltyMultiplier = BASE_REMAINING_TRIES - remainingTries;
    const timeout = BASE_SUBMIT_TIMEOUT_SECONDS * penaltyMultiplier;

    setTimeoutSeconds(timeout);
    const id = setInterval(() => {
      setTimeoutSeconds((prev) => {
        if (prev <= 1) {
          queueMicrotask(() => setSubmitState("idle"));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => {
      clearInterval(id);
    };
  }, [submitState, setSubmitState]);

  useEffect(() => {
    if (trace.length > prevLengthRef.current)
      setTraceNotification(true);
    prevLengthRef.current = trace.length;
  }, [trace.length]);

  return (
    <ContentWrapper title={`${dictionary.game.gameTitle} - ${shortenedGameId}`}>
      <Tabs defaultValue="code" className="h-full w-full flex flex-col" value={activeTab} onValueChange={(v) => setActiveTab(v as BattleTab)}>
        <div className="flex-wrap gap-2 flex items-center justify-between px-4 py-2 bg-black/20 border-b border-px border-white/10">
          <TabsList className="flex gap-2">
              <TabsTrigger value="code">
                {dictionary.game.codeTab}
              </TabsTrigger>
              <TabsTrigger value="subject">
                {dictionary.game.subjectTab}
              </TabsTrigger>
              <TabsTrigger className={cn("!relative", traceNotification ?  "animate-pulse bg-primary/20" : "")} value="trace">
                {dictionary.game.traceTab}
                {traceNotification &&
                  <div className="absolute top-[-4px] right-[-4px] h-2.5 w-2.5 rounded-full flex items-center justify-center bg-primary/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  </div>
                }
              </TabsTrigger>
            </TabsList>
          <Button variant="danger" onClick={leaveGame}>
            {dictionary.game.abandonGame}
          </Button>
        </div>

        <div className="flex-1 min-h-0 p-4 flex">
          <TabsContent value="code" className="flex-1 w-full">
            <Editor
              height="100%"
              width="100%"
              theme="vs-dark"
              defaultLanguage="c"
              value={code}
              onChange={setCode}
              className="border border-px border-white/10 rounded-lg overflow-hidden"
              options={{
                minimap: { enabled: false }
              }}
            />
          </TabsContent>
          <TabsContent value="subject" className="flex-1 min-h-0 w-full flex flex-col border border-px border-white/10 rounded-md overflow-hidden">
              <div className="w-full flex flex-col gap-2 bg-black/50 py-4 px-6 border-b border-px border-white/10">
                <p className="text-sm text-white font-medium font-mono">{selectedChallenge.name}</p>
              </div>
              <ScrollArea className="flex-1 min-h-0 w-full overflow-hidden bg-white/5">
                <div className="py-3 px-4 text-sm text-sub-text font-medium font-mono whitespace-pre-wrap">
                  {selectedChallenge.description}
                </div>
              </ScrollArea>
          </TabsContent>
          <TabsContent value="trace" className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
            <Trace />
          </TabsContent>
        </div>

        <div className="flex gap-4 px-4 py-2 border-t border-px border-white/10">
          {(() => {
            const cards = [];
            for (const player of gamePlayers) {
              cards.push(
                <div key={player.username} className="flex items-center justify-center bg-black/30 border border-px border-white/10 rounded-md p-2 gap-1">
                  <div className="flex items-center gap-2">
                    <ProfilePicture profilePictureUrl={player.profilePictureUrl} size={7} />
                    <p className="text-sub-text font-medium">{player.username}</p>
                  </div>
                  <div className="pl-1 flex items-center gap-1.5">
                  {player.passedChallenge === null ? (
                      <StatusDot variant="inGame" />
                    ) : player.passedChallenge === false ? (
                      <StatusDot variant="fail" />
                    ) : (
                      <StatusDot variant="success" />
                    )
                  }
                  </div>
                </div>
              );
            }
            return <div className="flex items-center gap-2">{cards}</div>;
          })()}
          <Button
            variant="primary" 
            fullWidth={true}
            onClick={submitState === "idle" ? submitCode : (() => {})}
            disabled={submitState !== "idle" || !code || code.trim() === "" || activeTab !== "code"}
          >
            {submitState !== "idle" && (
              <Loader2Icon className="size-4 animate-spin" />
            )}
            {submitState === "idle" && dictionary.game.submitCode}
            {submitState === "waiting" && dictionary.game.waitingForResult}
            {submitState === "timeout" && dictionary.game.retryInSeconds.replace("{{seconds}}", String(timeoutSeconds))}
          </Button>
        </div>

      </Tabs>
    </ContentWrapper>
  );
}
