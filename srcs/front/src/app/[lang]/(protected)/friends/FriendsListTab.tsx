"use client";

import { Users } from "lucide-react";
import { FriendsSkeleton } from "../../../../components/ui/skeleton";
import UserProfile, { UserType } from "./UserProfile";
import { useEffect, useState } from "react";

type Variant = "friends" | "pending";

type Props = {
  variant: Variant;
  users: UserType[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  onRemove: (username: string) => void;
  onAccept?: (username: string) => void;
};

export default function FriendsListTab({
  variant,
  users,
  isLoading,
  error,
  emptyMessage,
  onRemove,
  onAccept,
}: Props) {
  const display = variant === "friends" ? "friendsList" : "pendingList";
  const skeletonIsFriends = variant === "friends";
  const [showSkeleton, setShowSkeleton] = useState<boolean>(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
      return;
    }
    const id = setTimeout(() => setShowSkeleton(false), 500);
    return () => clearTimeout(id);
  }, [isLoading]);

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      {showSkeleton ? (
        <FriendsSkeleton isFriends={skeletonIsFriends} />
      ) : error ? (
        <div className="w-full flex-1 min-h-0 flex items-center justify-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="w-full flex-1 min-h-0 flex items-center justify-center flex-col gap-2">
          <Users size={50} />
          <p className="text-sub-text">{emptyMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {users.map((user) => (
            <UserProfile
              user={user}
              display={display}
              key={user.username}
              onRemove={() => onRemove(user.username)}
              onAccept={
                variant === "pending"
                  ? () => onAccept?.(user.username)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
