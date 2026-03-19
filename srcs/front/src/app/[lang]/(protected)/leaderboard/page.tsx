"use client";

import { useEffect, useMemo, useState } from "react";
import ContentWrapper from "../../../../components/ContentWrapper";
import Pagination from "../../../../components/ui/pagination";
import ProfilePicture from "../../../../components/ProfilePicture";
import { TextInput } from "../../../../components/ui/Input";
import { useAuth } from "../../../../contexts/AuthContext";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { useModal } from "../../../../contexts/ModalContext";
import { API_URL } from "../../../../lib/utils";
import { EllipsisVertical, MessageCircleMore, Trophy, User } from "lucide-react";
import { toast } from "sonner";
import ProfileModal from "../../../../components/ProfileModal";
import { ChatModal } from "../../../../components/Chat";
import { LeaderboardSkeleton } from "../../../../components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 7;
const LEADERBOARD_LIMIT = 100;

type LeaderboardPlayer = {
  id: number;
  username: string;
  profilePictureUrl: string | null;
  xp: number;
};

export default function Page() {
  const { token, logout, username: myUsername } = useAuth();
  const { dictionary } = useLanguage();
  const { openModal } = useModal();

  const [isLoading, setIsLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [searchPlayer, setSearchPlayer] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!token)
        return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/leaderboard?page=1&limit=${LEADERBOARD_LIMIT}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          setIsLoading(false);
          logout();
          toast.error(dictionary.common.sessionExpired);
          return;
        }

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || dictionary.common.errorOccurred);

        setPlayers(Array.isArray(data) ? data : []);
        setPage(1);
      } catch (err: any) {
        setError(err.message || dictionary.common.errorOccurred);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [token, logout, dictionary.common.errorOccurred, dictionary.common.sessionExpired]);

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
      return;
    }
    const id = setTimeout(() => setShowSkeleton(false), 500);
    return () => clearTimeout(id);
  }, [isLoading]);

  const filteredPlayers = useMemo(() => {
    const query = searchPlayer.trim().toLowerCase();
    if (!query)
      return players;
    return players.filter((player) => player.username.toLowerCase().includes(query));
  }, [players, searchPlayer]);

  const rankByPlayerId = useMemo(() => {
    return new Map(players.map((player, index) => [player.id, index + 1]));
  }, [players]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE) || 1),
    [filteredPlayers.length]
  );

  useEffect(() => {
    setPage(1);
  }, [searchPlayer]);

  const paginatedPlayers = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = page * ITEMS_PER_PAGE;
    return filteredPlayers.slice(start, end);
  }, [filteredPlayers, page]);

  return (
    <ContentWrapper
      title={dictionary.leaderboard.title}
      autoHeight
      minContentHeightClass="min-h-[30rem] md:min-h-[36rem] h-fit"
    >
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-px border-white/10">
          <p className="text-sm font-mono text-sub-text">{dictionary.leaderboard.topLabel.replace("{{count}}", String(LEADERBOARD_LIMIT))}</p>
          <TextInput
            id="search-player"
            customWidth="w-[135px]"
            placeholder={dictionary.leaderboard.searchPlaceholder}
            value={searchPlayer}
            onChange={(e) => setSearchPlayer(e.target.value)}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          {showSkeleton ? (
            <LeaderboardSkeleton items={ITEMS_PER_PAGE} />
          ) : error ? (
            <div className="w-full flex-1 min-h-0 flex items-center justify-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : paginatedPlayers.length === 0 ? (
            <div className="w-full flex-1 min-h-0 flex items-center justify-center flex-col gap-2">
              <Trophy size={50} />
              <p className="text-sub-text">{searchPlayer.trim() ? dictionary.leaderboard.noSearchResult : dictionary.leaderboard.empty}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {paginatedPlayers.map((player, index) => {
                const rank = rankByPlayerId.get(player.id) ?? (page - 1) * ITEMS_PER_PAGE + index + 1;
                const isMe = myUsername === player.username;
                const level = Math.floor(player.xp / 100);
                const rankClassName = rank === 1
                  ? "text-podium-gold drop-shadow-[0_0_8px_currentColor]"
                  : rank === 2
                  ? "text-podium-silver drop-shadow-[0_0_8px_currentColor]"
                  : rank === 3
                  ? "text-podium-bronze drop-shadow-[0_0_8px_currentColor]"
                  : "text-sub-text";
                const xpInLevel = player.xp % 100;
                const xpProgress = Math.max(0, Math.min(100, xpInLevel));

                return (
                  <div
                    key={player.id}
                    className="w-full flex items-center justify-between py-3 px-4 transition-colors duration-200 hover:bg-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-mono min-w-8 ${rankClassName}`}>#{rank}</span>
                      <ProfilePicture profilePictureUrl={player.profilePictureUrl} size={12} />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-semibold">{player.username}</p>
                          {!isMe && (
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
                                    { variant: "chat", preventClose: true }
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
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-text">{dictionary.leaderboard.levelLabel}</span>
                        <span className="font-mono text-white">{level}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1 min-w-32">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-text">{dictionary.leaderboard.xpLabel}</span>
                          <span className="font-mono text-white">{player.xp}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${xpProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!showSkeleton && (
          <div className="flex items-center justify-center py-2 border-t border-white/10 bg-black/20">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </ContentWrapper>
  );
}
