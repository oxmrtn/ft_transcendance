"use client";

import { Users } from "lucide-react";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { FriendsSkeleton } from "../../../../components/ui/skeleton";
import UserProfile, { UserType } from "./UserProfile";

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

  return (
    <ScrollArea className="flex-1 min-h-0 w-full overflow-hidden">
      <div className="h-full">
        {isLoading ? (
          <FriendsSkeleton isFriends={skeletonIsFriends} />
        ) : error ? (
          <div className="h-full w-full flex items-center justify-center min-h-[200px]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center flex flex-col gap-2 min-h-[200px]">
            <Users size={50} />
            <p className="text-sub-text">{emptyMessage}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {users.map((user, index) => (
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
    </ScrollArea>
  );
}
