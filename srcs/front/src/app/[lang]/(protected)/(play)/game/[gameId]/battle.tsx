import React, { useEffect, useState } from "react";
import ContentWrapper from "../../../../../../components/ContentWrapper";
import { Heart, Loader2Icon, Skull } from "lucide-react";
import Button from "../../../../../../components/ui/Button";
import { useLanguage } from "../../../../../../contexts/LanguageContext";
import { useGame } from "../../../../../../contexts/GameContext";
import { useSocket } from "../../../../../../contexts/SocketContext";
import { Editor } from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";
import ProfilePicture from "../../../../../../components/ProfilePicture";
import { useAuth } from "../../../../../../contexts/AuthContext";

const BASE_SUBMIT_TIMEOUT_SECONDS = 15;
const BASE_REMAINING_TRIES = 3;

export default function Battle() {
  const { username } = useAuth();
  const { gameId, players, submitState, setSubmitState } = useGame();
  const { socket } = useSocket();
  const { dictionary } = useLanguage();
  const [code, setCode] = useState("");
  const [timeoutSeconds, setTimeoutSeconds] = useState(0);

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

  return (
    <ContentWrapper title={dictionary.game.title}>
      <Tabs defaultValue="subject" className="h-full w-full flex flex-col">
        <div className="flex-wrap gap-2 flex items-center justify-between px-4 py-2 bg-black/20 border-b border-px border-white/10">
          <TabsList className="flex gap-2">
              <TabsTrigger value="subject">
                {dictionary.game.subjectTab}
              </TabsTrigger>
              <TabsTrigger value="code">
                {dictionary.game.codeTab}
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
            ...
          </TabsContent>
        </div>

        <div className="flex gap-4 px-4 py-2 border-t border-px border-white/10">
          {(() => {
            const cards = [];
            for (const player of players) {
              cards.push(
                <div key={player.username} className="flex items-center justify-center bg-black/50 border border-px border-white/10 rounded-md p-2 gap-2 h-full">
                  <div className="flex items-center gap-2">
                    <ProfilePicture profilePictureUrl={player.profilePictureUrl} size={7} />
                    <p className="text-sub-text font-medium">{player.username}</p>
                  </div>
                  <div className="flex items-center gap-1">
                  {player.remainingTries > 0 ? (
                    <>
                      <p className="text-white font-medium font-mono">{player.remainingTries}</p>
                      <Heart className="size-5 text-pink-400" />
                    </>
                  ) : (
                    <Skull className="size-5 text-destructive/80" />
                  )}
                  </div>
                </div>
              );
            }
            return <div className="flex items-center gap-2 h-full">{cards}</div>;
          })()}
          <Button
            variant="primary" 
            fullWidth={true}
            onClick={submitState === "idle" ? submitCode : (() => {})}
            disabled={submitState !== "idle" || !code || code.trim() === ""}
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
