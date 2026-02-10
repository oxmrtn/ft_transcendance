"use client";

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import ContentWrapper from '../../../../components/ContentWrapper';
import { useSocket } from '../../../../contexts/SocketContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import { TextInput } from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { FriendsSkeleton } from '../../../../components/ui/skeleton';
import Pagination from '../../../../components/ui/pagination';
import UserProfile, { type User } from '../../../../components/UserProfile';
import { toast } from 'sonner';
import { API_URL } from '../../../../lib/utils';

export default function Page() {
  const { token } = useAuth();
  const { socket } = useSocket();
  const { dictionary } = useLanguage();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [pending, setPending] = useState<User[]>([]);
  const [searchFriend, setSearchFriend] = useState("");
  const [friendsPage, setFriendsPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const itemsPerPage = 7;

  if (!dictionary)
    return null;

  const totalFriendsPages = Math.ceil(friends.length / itemsPerPage) || 1;
  const startFriendsIndex = (friendsPage - 1) * itemsPerPage;
  const endFriendsIndex = startFriendsIndex + itemsPerPage;
  const displayedFriends = friends.slice(startFriendsIndex, endFriendsIndex);

  const totalPendingPages = Math.ceil(pending.length / itemsPerPage) || 1;
  const startPendingIndex = (pendingPage - 1) * itemsPerPage;
  const endPendingIndex = startPendingIndex + itemsPerPage;
  const displayedPending = pending.slice(startPendingIndex, endPendingIndex);

  const fetchFriends = async () => {
    setLoading(true);
    setError(null);
    setFriends([]);

    try {
      const response = await fetch(`${API_URL}/social/friends`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || dictionary.login.unexpectedError);
      }

      setFriends(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    setPending([]);

    try {
      const response = await fetch(`${API_URL}/social/request`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || dictionary.login.unexpectedError);
      }

      setPending(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const sendFriendRequest = async (friendUsername: string) => {
    const toastId = toast.loading(`${dictionary.friends.sendingRequest} ${friendUsername}...`);

    try {
      const response = await fetch(`${API_URL}/social/request/${friendUsername}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || dictionary.login.unexpectedError);
      }

      toast.success(`${dictionary.friends.requestSent} ${friendUsername}`, {
        id: toastId,
      });

    } catch (err: any) {
      toast.error(`${dictionary.friends.error} : ${err.message}`, {
        id: toastId,
      });
    }
  }

  const removeFriend = async (friendUsername: string) => {
    setLoading(true);

    const toastId = toast.loading(`${dictionary.friends.removingFriend} ${friendUsername}...`);

    try {
      const response = await fetch(`${API_URL}/social/friends/${friendUsername}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || dictionary.login.unexpectedError);
      }

      setFriends(prevFriends => prevFriends.filter(friend => friend.username !== friendUsername));

      toast.success(`${friendUsername} ${dictionary.friends.friendRemoved}`, {
        id: toastId,
      });

    } catch (err: any) {
      toast.error(`${dictionary.friends.error} : ${err.message}`, {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  }

  const handlePendingRequest = async (pendingUsername: string, isAccept: boolean) => {
    setLoading(true);

    const toastId = toast.loading(`${isAccept ? dictionary.friends.accepting : dictionary.friends.rejecting} ${pendingUsername}...`);

    try {
      const response = await fetch(`${API_URL}/social/request/${pendingUsername}/${isAccept ? "accept" : "reject"}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || dictionary.login.unexpectedError);
      }

      setPending(prevPending => prevPending.filter(pending => pending.username !== pendingUsername));

      toast.success(`${pendingUsername} ${isAccept ? dictionary.friends.accepted : dictionary.friends.rejected}`, {
        id: toastId,
      });

    } catch (err: any) {
      toast.error(`${dictionary.friends.error} : ${err.message}`, {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  }

  const updateUserStatus = (user: User) => {
    console.log("user-status", user);
    setFriends(prevFriends => prevFriends.map(friend =>
      friend.username === user.username
        ? { ...friend, online: user.online }
        : friend
    ));
  }

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!socket)
      return;
    socket.on('user-status', updateUserStatus);
    return () => {
      socket.off('user-status', updateUserStatus);
    }
  }, [socket]);

  return (
    <ContentWrapper title={dictionary.friends.title}>
      <Tabs defaultValue="friends" className="h-full w-full flex">

        <TabsList className="flex items-center justify-center bg-black/20 border-b border-px border-white/10">
          <TabsTrigger value="friends" className="tabs-trigger" onClick={() => { fetchFriends() }}>
            {dictionary.friends.friendsTab}
          </TabsTrigger>
          <TabsTrigger value="pending" className="tabs-trigger" onClick={() => { fetchPending() }}>
            {dictionary.friends.pendingTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="flex-1 flex flex-col">
          <div className="flex-1">
            {isLoading ? (
              <FriendsSkeleton isFriends={true} />
            ) : error ? (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center flex flex-col gap-2 w-fit w-fit">
                <Users size="50" />
                <p className="text-sub-text">{dictionary.friends.noFriends}</p>
              </div>
            ) : (
              <div className="h-full w-full flex flex-col py-2.5 gap-0.5">
                {displayedFriends.map((friend, index) => (
                  <UserProfile
                    user={friend}
                    display="friendsList"
                    key={index}
                    onRemove={() => { removeFriend(friend.username) }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4 p-4 border-t border-px border-white/10">
            <div className="flex gap-2">
              <TextInput
                customWidth="w-[191px]"
                placeholder={dictionary.friends.searchPlaceholder}
                id="search-friend"
                onChange={e => setSearchFriend(e.target.value)}
              />
              <Button variant="primary" onClick={() => { sendFriendRequest(searchFriend) }}>
                {dictionary.friends.addButton}
              </Button>
            </div>
            <Pagination
              currentPage={friendsPage}
              totalPages={totalFriendsPages}
              onPageChange={setFriendsPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="pending" className="flex-1 flex flex-col">
          <div className="flex-1">
            {isLoading ? (
              <FriendsSkeleton />
            ) : error ? (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : pending.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center flex flex-col gap-2 w-fit w-fit">
                <Users size="50" />
                <p className="text-sub-text">{dictionary.friends.noPending}</p>
              </div>
            ) : (
              <div className="h-full w-full flex flex-col justify-between py-2">
                {displayedPending.map((pendingRequest, index) => (
                  <UserProfile
                    user={pendingRequest}
                    display="pendingList"
                    key={index}
                    onAccept={() => { handlePendingRequest(pendingRequest.username, true) }}
                    onRemove={() => { handlePendingRequest(pendingRequest.username, false) }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 py-5 px-4 border-t border-px border-white/10">
            <Pagination
              currentPage={pendingPage}
              totalPages={totalPendingPages}
              onPageChange={setPendingPage}
            />
          </div>
        </TabsContent>

      </Tabs>
    </ContentWrapper>
  );
}