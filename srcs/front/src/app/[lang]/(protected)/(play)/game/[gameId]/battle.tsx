import React, { useEffect, useState } from "react";
import ContentWrapper from "../../../../../../components/ContentWrapper";
import { Check, Heart, Loader2Icon, Skull } from "lucide-react";
import Button from "../../../../../../components/ui/Button";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import { BASE_REMAINING_TRIES, BASE_SUBMIT_TIMEOUT_SECONDS, useGame } from "../../../../../../contexts/GameContext";
import { useSocket } from "../../../../../../contexts/SocketContext";
import { Editor } from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";
import ProfilePicture from "../../../../../../components/ProfilePicture";
import { useAuth } from "../../../../../../contexts/AuthContext";
import Trace from "./trace";
import { cn } from "../../../../../../lib/utils";

export default function Battle() {
  const { username } = useAuth();
  const { trace, gameId, players, submitState, setSubmitState } = useGame();
  const { socket } = useSocket();
  const { dictionary } = useLanguage();
  const [code, setCode] = useState("");
  const [timeoutSeconds, setTimeoutSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState("code");
  const [traceNotification, setTraceNotification] = useState(false);

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
  
    const penaltyMultiplier = BASE_REMAINING_TRIES - (players.find((player) => player.username === username).remainingTries);
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
    setTraceNotification(true);
  }, [trace]);

  return (
    <ContentWrapper title={`${dictionary.game.gameTitle} - ${shortenedGameId}`}>
      <Tabs defaultValue="code" className="h-full w-full flex flex-col">
        <div className="flex-wrap gap-2 flex items-center justify-between px-4 py-2 bg-black/20 border-b border-px border-white/10">
          <TabsList className="flex gap-2">
              <TabsTrigger value="code" onClick={() => setActiveTab("code")}>
                {dictionary.game.codeTab}
              </TabsTrigger>
              <TabsTrigger value="subject" onClick={() => setActiveTab("subject")}>
                {dictionary.game.subjectTab}
              </TabsTrigger>
              <TabsTrigger className={cn("!relative", traceNotification ?  "animate-pulse bg-primary/20" : "")} value="trace" onClick={() => { setActiveTab("trace"); setTraceNotification(false); }}>
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

        <div className="flex-1 p-4">
          <TabsContent value="code" className="h-full w-full">
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
          <TabsContent value="subject" className="h-full w-full">
            
          </TabsContent>
          <TabsContent value="trace" className="h-full w-full">
            <Trace />
          </TabsContent>
        </div>

        <div className="flex gap-4 px-4 py-2 border-t border-px border-white/10">
          {(() => {
            const cards = [];
            for (const player of players) {
              cards.push(
                <div key={player.username} className="flex items-center justify-center bg-black/50 border border-px border-white/10 rounded-md p-2 gap-1">
                  <div className="flex items-center gap-2">
                    <ProfilePicture profilePictureUrl={player.profilePictureUrl} size={7} />
                    <p className="text-sub-text font-medium">{player.username}</p>
                  </div>
                  <div className="pl-1 flex items-center gap-1">
                  {!player.passedChallenge && player.remainingTries > 0 ? (
                    <>
                      <p className="text-white font-medium font-mono">{player.remainingTries}</p>
                      <Heart className="size-5 text-pink-400" fill="currentColor" />
                    </>
                  ) : player.passedChallenge === false ? (
                    <Skull className="size-4.5 text-destructive/80" />
                  ) : (
                    <Check className="size-4.5 text-green" />
                  )}
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
