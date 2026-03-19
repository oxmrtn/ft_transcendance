"use client";

import React, { useEffect, useState } from "react";
import ContentWrapper from "../../../../components/ContentWrapper";
import Button from "../../../../components/ui/Button";
import { TextInput } from "../../../../components/ui/Input";
import { useSocket } from "../../../../contexts/SocketContext";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { useGame } from "../../../../contexts/GameContext";
import { useRouter } from "next/navigation";
import Pagination from "../../../../components/ui/pagination";
import { API_URL } from "../../../../lib/utils";
import { useAuth } from "../../../../contexts/AuthContext";
import { toast } from "sonner";
import { SquareTerminal } from "lucide-react";
import { WaitingRoomsSkeleton } from "../../../../components/ui/skeleton";

const ITEMS_PER_PAGE = 7;
const WAITING_ROOMS_LIMIT = 100;

type WaitingRoom = {
  gameId: string;
  creatorUsername: string | null;
  playerCount: number;
};

export default function Page() {
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState<WaitingRoom[]>([]);
  const [roomsPage, setRoomsPage] = useState(1);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const { socket } = useSocket();
  const { dictionary, lang } = useLanguage();
  const { gameId, gameState } = useGame();
  const { token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!gameId || gameState === "finished")
      return;
    router.replace(`/${lang}/game/${gameId}`);
  }, [gameId, gameState, router, lang]);

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

  useEffect(() => {
    const fetchWaitingRooms = async () => {
      if (!token)
        return;

      setIsLoadingRooms(true);
      setRoomsError(null);

      try {
        const response = await fetch(`${API_URL}/game/rooms/waiting?page=1&limit=${WAITING_ROOMS_LIMIT}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          setIsLoadingRooms(false);
          logout();
          toast.error(dictionary.common.sessionExpired);
          return;
        }

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || dictionary.common.errorOccurred);

        setRooms(Array.isArray(data) ? data : []);
        setRoomsPage(1);
      } catch (err: any) {
        setRoomsError(err.message || dictionary.common.errorOccurred);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchWaitingRooms();
  }, [token, logout, dictionary.common.errorOccurred, dictionary.common.sessionExpired]);

  useEffect(() => {
    if (isLoadingRooms) {
      setShowSkeleton(true);
      return;
    }
    const id = setTimeout(() => setShowSkeleton(false), 500);
    return () => clearTimeout(id);
  }, [isLoadingRooms]);

  useEffect(() => {
    if (!socket)
      return;

    const onWaitingRoomsUpdate = (payload: { rooms?: WaitingRoom[] }) => {
      setRooms(Array.isArray(payload?.rooms) ? payload.rooms : []);
    };

    socket.on("waiting-rooms-update", onWaitingRoomsUpdate);
    socket.emit("get-waiting-rooms");

    return () => {
      socket.off("waiting-rooms-update", onWaitingRoomsUpdate);
    };
  }, [socket]);

  const totalPages = Math.max(1, Math.ceil(rooms.length / ITEMS_PER_PAGE) || 1);

  useEffect(() => {
    if (roomsPage > totalPages)
      setRoomsPage(totalPages);
  }, [roomsPage, totalPages]);

  const paginatedRooms = rooms.slice(
    (roomsPage - 1) * ITEMS_PER_PAGE,
    roomsPage * ITEMS_PER_PAGE
  );

  const shortenGameId = (id: string) => {
    if (!id || id.length <= 8)
      return id;
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
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
              customWidth="w-[129px]"
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

        <div className="flex-1 min-h-0 flex flex-col">
          {showSkeleton ? (
            <WaitingRoomsSkeleton items={ITEMS_PER_PAGE} />
          ) : roomsError ? (
            <div className="w-full flex-1 min-h-0 flex items-center justify-center">
              <p className="text-sm text-red-400">{roomsError}</p>
            </div>
          ) : paginatedRooms.length === 0 ? (
            <div className="w-full flex-1 min-h-0 flex items-center justify-center flex-col gap-2">
              <SquareTerminal size={50} />
              <p className="text-sub-text">{dictionary.play.noWaitingRooms}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {paginatedRooms.map((room) => (
                <div
                  key={room.gameId}
                  className="w-full flex items-center justify-between py-3 px-4 transition-colors duration-200 hover:bg-white/5"
                >
                  <div className="flex items-center gap-8">
                    <p className="font-mono text-sub-text text-sm">
                      {dictionary.play.roomIdLabel}: <span className="text-white">{shortenGameId(room.gameId)}</span>
                    </p>
                    <p className="font-mono text-sub-text text-sm">
                      {dictionary.play.creatorLabel}: <span className="text-white">{room.creatorUsername ?? dictionary.play.unknownCreator}</span>
                    </p>
                    <p className="font-mono text-sub-text text-sm">
                      {dictionary.play.playersLabel}: <span className="text-white">{room.playerCount}/4</span>
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => socket?.emit("join-room", { gameId: room.gameId })}>
                    {dictionary.play.joinRoom}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {!showSkeleton && (
          <div className="flex items-center justify-center py-2 border-t border-white/10 bg-black/20">
            <Pagination
              currentPage={roomsPage}
              totalPages={totalPages}
              onPageChange={setRoomsPage}
            />
          </div>
        )}
      </div>
    </ContentWrapper>
  );
}
