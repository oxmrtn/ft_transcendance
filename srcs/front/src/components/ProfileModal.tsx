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

interface UserProfile {
  username: string;
  profilePictureUrl: string | null;
  createdAt: string;
  status: boolean;
  friendStatus: "friend" | "pending" | null;
}

export default function ProfileModal({ username }: { username: string }) {
  const { token, logout } = useAuth();
  const { dictionary, lang } = useLanguage();
  const { closeModal, openModal } = useModal();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriendActionLoading, setIsFriendActionLoading] = useState(false);

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
        toast.error(data.message || dictionary.common.errorOccurred);

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
        toast.error(data.message || dictionary.common.errorOccurred, { id: toastId });

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
        toast.error(data.message || dictionary.common.errorOccurred, { id: toastId });

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

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="w-[380px] sm:w-[420px] md:w-[460px] modal-surface rounded-xl border border-white/10 shadow-[0_0_40px] shadow-black/80 overflow-hidden">
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

      <div className="p-5 flex flex-col gap-5">
        {isLoading && (
          <div className="flex flex-col gap-3">
            <div className="h-16 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-24 rounded-lg bg-white/5 animate-pulse" />
          </div>
        )}

        {!isLoading && profile && (
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

            <div className="border border-white/10 rounded-lg bg-black/30 px-4 py-3 flex justify-between items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-muted-text">{dictionary.profile.friendStatus}</span>
                <span className="text-sm text-sub-text">{friendStatus()}</span>
              </div>
              <div className="flex items-center">
                {profile.friendStatus === "friend" && (
                  <div className="min-w-[120px]">
                    <Button
                      variant="danger"
                      fullWidth
                      disabled={isFriendActionLoading}
                      onClick={handleRemoveFriend}
                    >
                      {dictionary.profile.removeFriendButton}
                    </Button>
                  </div>
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
                      onClick={() => {}}
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
