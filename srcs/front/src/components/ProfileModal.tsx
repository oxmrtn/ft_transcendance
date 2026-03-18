"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import { API_URL } from "../lib/utils";
import ProfilePicture from "./ProfilePicture";
import StatusDot from "./StatusDot";
import { X, MessageCircleMore } from "lucide-react";
import { toast } from "sonner";
import { ChatModal } from "./Chat";
import Button from "./ui/Button";
import { ProfileSkeleton } from "./ui/skeleton";
import { useSocket } from "../contexts/SocketContext";

interface UserProfile {
  username: string;
  profilePictureUrl: string | null;
  createdAt: string;
  status: boolean;
  friendStatus: "friend" | "pending" | null;
  xp: number;
  win: number;
  gamesPlayed: number;
}

export default function ProfileModal({ username }: { username: string }) {
  const { token, logout } = useAuth();
  const { dictionary, lang } = useLanguage();
  const { closeModal, openModal } = useModal();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isFriendActionLoading, setIsFriendActionLoading] = useState(false);
  const { socket } = useSocket();
  const fetchProfile = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/social/profile/${username}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        toast.error(dictionary.common.sessionExpired);
        closeModal();
        return;
      }

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || dictionary.common.errorOccurred);

      setProfile(data);
    } catch (err: any) {
      toast.error(err.message || dictionary.common.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(lang, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const friendStatus = () => {
    if (!profile)
      return null;

    if (profile.friendStatus === "friend")
      return dictionary.profile.friend;
    if (profile.friendStatus === "pending")
      return dictionary.profile.pending;
    return dictionary.profile.notFriend;
  };

  const handleSendFriendRequest = async () => {
    if (!token || !profile)
      return;

    setIsFriendActionLoading(true);
    const friendUsername = profile.username;
    const toastId = toast.loading(`${dictionary.friends.sendingRequest} ${friendUsername}...`);

    try {
      const response = await fetch(`${API_URL}/social/request/${friendUsername}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        toast.error(dictionary.common.sessionExpired, { id: toastId });
        closeModal();
        return;
      }

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || dictionary.common.errorOccurred);

      setProfile(prev => prev ? { ...prev, friendStatus: "pending" } : prev);

      toast.success(`${dictionary.friends.requestSent} ${friendUsername}`, {
        id: toastId,
      });
    } catch (err: any) {
      toast.error(`${dictionary.friends.error} : ${err.message || dictionary.common.errorOccurred}`, { id: toastId });
    } finally {
      setIsFriendActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!token || !profile)
      return;

    setIsFriendActionLoading(true);
    const friendUsername = profile.username;
    const toastId = toast.loading(`${dictionary.friends.removingFriend} ${friendUsername}...`);

    try {
      const response = await fetch(`${API_URL}/social/friends/${friendUsername}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        toast.error(dictionary.common.sessionExpired, { id: toastId });
        closeModal();
        return;
      }

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || dictionary.common.errorOccurred);

      setProfile(prev => prev ? { ...prev, friendStatus: null } : prev);

      toast.success(`${friendUsername} ${dictionary.friends.friendRemoved}`, {
        id: toastId,
      });
    } catch (err: any) {
      toast.error(`${dictionary.friends.error} : ${err.message || dictionary.common.errorOccurred}`, { id: toastId });
    } finally {
      setIsFriendActionLoading(false);
    }
  };

  const updateUserStatus = (user: any) => {
    setProfile(prev => prev ? { ...prev, status: user.status } : prev);
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => {
        setShowSkeleton(false);
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setShowSkeleton(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!socket)
      return;
    socket.on('user-status', updateUserStatus);
    return () => {
      socket.off('user-status', updateUserStatus);
    }
  }, [socket]);

  return (
    <div className="w-[380px] sm:w-[420px] md:w-[460px] gradient-background rounded-xl border border-white/10 shadow-[0_0_40px] shadow-black/80 overflow-hidden">
      <div className="bg-black/40 flex items-center justify-between px-5 py-3 relative border-b border-white/10">
        <h1>{dictionary.profile.title}</h1>
        <button
          className="p-1 bg-white/0 rounded-md hover:bg-white/10 cursor-pointer transition-colors duration-200"
          onClick={closeModal}
        >
          <X className="size-6" />
        </button>
        <div className="grid-gradient absolute top-0 left-0 w-full h-full"></div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {showSkeleton && <ProfileSkeleton />}

        {!showSkeleton && profile && (
          <>
            <div className="flex items-center gap-4 border border-white/10 rounded-lg bg-black/40 px-4 py-3">
              <ProfilePicture profilePictureUrl={profile.profilePictureUrl} size={20} />
              <div className="flex flex-col gap-1">
                <p className="font-mono text-lg font-semibold">{profile.username}</p>
                <div className="flex items-center gap-2">
                  <StatusDot variant={profile.status ? "success" : "fail"} />
                  <span className="text-sm text-muted-text">
                    {profile.status ? dictionary.friends.online : dictionary.friends.offline}
                  </span>
                </div>
                <p className="text-xs text-muted-text">
                  {dictionary.profile.registeredSince} {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>

            <div className="border border-white/10 rounded-lg bg-black/30 px-4 py-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-text">{dictionary.profile.level}</span>
                  {(() => {
                    const level = Math.floor(profile.xp / 100);
                    const currentXp = profile.xp % 100;
                    const percent = Math.min(100, (currentXp / 100) * 100);
                    return (
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-sm text-sub-text font-mono">{level}</span>
                        <div className="w-28 h-2 rounded-full bg-white/10 overflow-hidden border border-white/10">
                          <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-xs text-muted-text font-mono">
                          {currentXp}/100 XP
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted-text">{dictionary.profile.wins}</span>
                  <span className="text-sm text-sub-text font-mono">{profile.win}</span>
                  <span className="text-xs text-muted-text">
                    {dictionary.profile.winRate}:{" "}
                    {(() => {
                      const { win, gamesPlayed } = profile;
                      if (!gamesPlayed)
                        return "0%";
                      const rate = Math.round((win / gamesPlayed) * 100);
                      return `${rate}%`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-white/10 rounded-lg bg-black/30 px-4 py-3 flex justify-between items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-muted-text">{dictionary.profile.friendStatus}</span>
                <span className="text-sm text-sub-text">{friendStatus()}</span>
              </div>
              <div className="flex items-center">
                {profile.friendStatus === "friend" && (
                  <Button
                    variant="danger"
                    disabled={isFriendActionLoading}
                    onClick={handleRemoveFriend}
                  >
                    {dictionary.profile.removeFriendButton}
                  </Button>
                )}
                {profile.friendStatus === null && (
                  <div className="min-w-[120px]">
                    <Button
                      variant="primary"
                      fullWidth
                      disabled={isFriendActionLoading}
                      onClick={handleSendFriendRequest}
                    >
                      {dictionary.profile.addFriendButton}
                    </Button>
                  </div>
                )}
                {profile.friendStatus === "pending" && (
                  <div className="min-w-[120px]">
                    <Button
                      variant="primary"
                      fullWidth
                      disabled
                      onClick={() => { }}
                    >
                      {dictionary.profile.requestAlreadySent}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                openModal(
                  <ChatModal target={profile.username} triggerId={Date.now()} />,
                  { variant: "chat", preventClose: true }
                );
              }}
            >
              <MessageCircleMore className="size-4" />
              {dictionary.profile.sendMessage}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
