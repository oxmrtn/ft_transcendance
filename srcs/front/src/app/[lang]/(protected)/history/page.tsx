"use client";

import { useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import { toast } from "sonner";
import ContentWrapper from "../../../../components/ContentWrapper";
import Pagination from "../../../../components/ui/pagination";
import { TextInput } from "../../../../components/ui/Input";
import { useAuth } from "../../../../contexts/AuthContext";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { API_URL } from "../../../../lib/utils";
import { HistorySkeleton } from "../../../../components/ui/skeleton";

const ITEMS_PER_PAGE = 7;
const HISTORY_LIMIT = 100;

type HistoryGame = {
  gameId: number;
  exercise: string;
  rank: number | null;
  finishedAt: string | null;
  timeTakenMs: number;
};

export default function Page() {
  const { token, logout } = useAuth();
  const { dictionary, lang } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<HistoryGame[]>([]);
  const [page, setPage] = useState(1);
  const [searchGameId, setSearchGameId] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token)
        return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/history/me?page=1&limit=${HISTORY_LIMIT}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
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

        setGames(Array.isArray(data?.games) ? data.games : []);
        setPage(1);
      } catch (err: any) {
        setError(err.message || dictionary.common.errorOccurred);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [token, logout, dictionary.common.errorOccurred, dictionary.common.sessionExpired]);

  const filteredGames = useMemo(() => {
    const query = searchGameId.trim();
    if (!query)
      return games;
    return games.filter((game) => String(game.gameId).includes(query));
  }, [games, searchGameId]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredGames.length / ITEMS_PER_PAGE) || 1),
    [filteredGames.length]
  );

  useEffect(() => {
    setPage(1);
  }, [searchGameId]);

  const paginatedGames = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = page * ITEMS_PER_PAGE;
    return filteredGames.slice(start, end);
  }, [filteredGames, page]);

  const shortenGameId = (id: number) => {
    const value = String(id);
    if (value.length <= 8)
      return value;
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  };

  const formatDate = (date: string | null) => {
    if (!date)
      return dictionary.history.notFinished;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const formatHour = (date: string | null) => {
    if (!date)
      return "--:--";
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDuration = (ms: number) => {
    if (!ms || ms <= 0)
      return "0s";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0)
      return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <ContentWrapper
      title={dictionary.history.title}
      autoHeight
      minContentHeightClass="min-h-[30rem] md:min-h-[36rem] h-fit"
    >
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-px border-white/10">
          <p className="text-sm font-mono text-sub-text">{dictionary.history.topLabel.replace("{{count}}", String(HISTORY_LIMIT))}</p>
          <TextInput
            id="search-game-id"
            customWidth="w-[129px]"
            placeholder={dictionary.play.roomIdPlaceholder}
            value={searchGameId}
            onChange={(e) => setSearchGameId(e.target.value)}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          {isLoading ? (
            <HistorySkeleton items={ITEMS_PER_PAGE} />
          ) : error ? (
            <div className="w-full flex-1 min-h-0 flex items-center justify-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : paginatedGames.length === 0 ? (
            <div className="w-full flex-1 min-h-0 flex items-center justify-center flex-col gap-2">
              <History size={50} />
              <p className="text-sub-text">{searchGameId.trim() ? dictionary.history.noSearchResult : dictionary.history.empty}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {paginatedGames.map((game) => (
                <div
                  key={game.gameId}
                  className="w-full py-3 px-4 transition-colors duration-200 hover:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-0">
                    <div className="flex flex-col gap-1 min-w-0 w-[46%] pr-4">
                      <p className="text-sm text-sub-text font-mono truncate">
                        {dictionary.history.gameIdLabel}: <span className="text-white">{shortenGameId(game.gameId)}</span>
                      </p>
                      <p className="text-sm text-sub-text font-mono truncate">
                        {dictionary.history.challengeLabel}: <span className="text-white">{game.exercise}</span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 w-[22%] text-left">
                      <p className="text-sm text-sub-text font-mono whitespace-nowrap">
                        {dictionary.history.rankLabel}: <span className="text-white">{game.rank ?? dictionary.history.noRank}</span>
                      </p>
                      <p className="text-sm text-sub-text font-mono whitespace-nowrap">
                        {dictionary.history.timeLabel}: <span className="text-white">{formatDuration(game.timeTakenMs)}</span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 ml-auto w-fit text-left">
                      <p className="text-sm text-sub-text font-mono whitespace-nowrap">
                        {dictionary.history.dateLabel}: <span className="text-white">{formatDate(game.finishedAt)}</span>
                      </p>
                      <p className="text-sm text-sub-text font-mono whitespace-nowrap">
                        {dictionary.history.hourLabel}: <span className="text-white">{formatHour(game.finishedAt)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isLoading && (
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
