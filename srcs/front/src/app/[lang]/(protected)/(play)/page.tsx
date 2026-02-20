"use client";

import React, { useState } from "react";
import ContentWrapper from "../../../../components/ContentWrapper";
import Button from "../../../../components/ui/Button";
import Pagination from "../../../../components/ui/pagination";
import { TextInput } from "../../../../components/ui/Input";
import { useSocket } from "../../../../contexts/SocketContext";
import { useLanguage } from "../../../../contexts/LanguageContext";

export default function Page() {
  const [roomId, setRoomId] = useState("");
  const { socket } = useSocket();
  const { dictionary } = useLanguage();

  const joinRoom = () => {
    if (!socket)
        return;
    socket.emit("join-room", { gameId: roomId });
  };

  const createRoom = () => {
    if (!socket)
        return;
    socket.emit("create-room");
  };

  return (
    <ContentWrapper title={dictionary.play.title}>
      <div className="flex flex-col h-full">
        <div className="flex-wrap gap-2 flex items-center justify-between px-4 py-2 bg-black/20 border-b border-px border-white/10">
          <Button variant="primary" onClick={createRoom}>
            {dictionary.play.createRoom}
          </Button>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              joinRoom();
            }}
          >
            <TextInput
              customWidth="w-[191px]"
              placeholder={dictionary.play.roomIdPlaceholder}
              id="room-id"
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
            />
            <Button variant="primary" type="submit">
              {dictionary.play.joinRoom}
            </Button>
          </form>
        </div>
        <div className="flex-1"></div>
        <div className="flex justify-center py-2 border-t border-px border-white/10">
          <Pagination
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        </div>
      </div>
    </ContentWrapper>
  );
}
