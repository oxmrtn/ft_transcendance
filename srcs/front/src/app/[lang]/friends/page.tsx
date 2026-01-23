"use client";

import { useState, useEffect } from 'react';
import React from 'react';
import { Users } from 'lucide-react';
import { cn } from '../../../lib/utils';
import ContentWrapper from '../../../components/ContentWrapper';
import AuthGuard from '../../../components/AuthGuard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/tabs"
import { TextInput } from '../../../components/Input';
import Button from '../../../components/Button';
import { FriendsSkeleton } from '../../../components/skeleton';
import Pagination from '../../../components/pagination';
import UserProfile, { type User } from '../../../components/UserProfile';
import { toast } from 'sonner';

export default function Page() {
  const { token } = useAuth();
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
      const response = await fetch("http://localhost:3333/social/friends", {
        method: "GET",
        headers: {
          "token": token
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
      const response = await fetch("http://localhost:3333/social/request", {
        method: "GET",
        headers: {
          "token": token
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
    const toastId = toast.loading(`Envoi de la demande d'ami à ${friendUsername}...`);

    try {
      const response = await fetch(`http://localhost:3333/social/request/${friendUsername}`, {
        method: "POST",
        headers: {
          "token": token
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || dictionary.login.unexpectedError);
      }
      
      toast.success(`Demande d'ami envoyée à ${friendUsername}`, {
        id: toastId,
      });

    } catch (err: any) {
      toast.error(`Erreur : ${err.message}`, {
        id: toastId,
      });
    }
  }

  const removeFriend = async (friendUsername: string) => {
    setLoading(true);

    const toastId = toast.loading(`Suppression de ${friendUsername}...`);

    try {
      const response = await fetch(`http://localhost:3333/social/friends/${friendUsername}`, {
        method: "DELETE",
        headers: {
          "token": token
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || dictionary.login.unexpectedError);
      }

      setFriends(prevFriends => prevFriends.filter(friend => friend.username !== friendUsername));
      
      toast.success(`${friendUsername} a été retiré de vos amis`, {
        id: toastId,
      });

    } catch (err: any) {
      toast.error(`Erreur : ${err.message}`, {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  }

  const handlePendingRequest = async (pendingUsername: string, isAccept: boolean) => {
    setLoading(true);

    const toastId = toast.loading(`${isAccept ? "Acceptation" : "Rejet"} de ${pendingUsername}...`);

    try {
      const response = await fetch(`http://localhost:3333/social/request/${pendingUsername}/${isAccept ? "accept" : "reject"}`, {
        method: "PATCH",
        headers: {
          "token": token
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || dictionary.login.unexpectedError);
      }

      setPending(prevPending => prevPending.filter(pending => pending.username !== pendingUsername));
      
      toast.success(`${pendingUsername} a été ${isAccept ? "accepté" : "rejeté"}`, {
        id: toastId,
      });

    } catch (err: any) {
      toast.error(`Erreur : ${err.message}`, {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <AuthGuard>
      <ContentWrapper title="friends">
        <Tabs defaultValue="friends" className="h-full w-full flex">

          <TabsList className="flex items-center justify-center bg-black/20 border-b border-px border-white/10">
            <TabsTrigger value="friends" className="tabs-trigger" onClick={() => { fetchFriends() }}>friends</TabsTrigger>
            <TabsTrigger value="pending" className="tabs-trigger" onClick={() => { fetchPending() }}>pending</TabsTrigger>
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
                  <p className="text-sub-text">No friends added yet.</p>
                </div>
              ) : (
                <div className="h-full w-full flex flex-col justify-between py-2">
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
                  customWidth="w-[174px]"
                  placeholder="Search for a player"
                  id="search-friend"
                  onChange={e => setSearchFriend(e.target.value)}
                />
                <Button variant="primary" onClick={() => { sendFriendRequest(searchFriend) }}>add</Button>
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
                  <p className="text-sub-text">No pending requests.</p>
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
    </AuthGuard>
  );
}