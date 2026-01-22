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

export default function Page() {
  const { token } = useAuth();
  const { dictionary } = useLanguage();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [friends, setFriends] = useState<User[]>([
    { "username": "user1", "online": false },
    { "username": "user2", "online": true },
    { "username": "user3", "online": false },
    { "username": "user4", "online": false },
    { "username": "user5", "online": true },
    { "username": "user6", "online": false },
    { "username": "user7", "online": false },
    { "username": "user8", "online": false },
  ]);
  const [pending, setPending] = useState<User[]>([]);
  
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

  // useEffect(() => {
  //   fetchFriends();
  // }, []);

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
                    <UserProfile user={friend} display="friendsList" key={index} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-4 p-4 border-t border-px border-white/10">              
              <div className="flex gap-2">
                <TextInput customWidth="w-[174px]" placeholder="Search for a player" id="search-friend"/>
                <Button variant="primary" onClick={() => {}}>add</Button>
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
                <div className="py-4 px-2 h-full w-full flex flex-col">
                  {displayedPending.map((pendingRequest, index) => (
                    <UserProfile user={pendingRequest} display="pendingList" key={index} />
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