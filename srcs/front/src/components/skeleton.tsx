import { cn } from '../lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-white/20 animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

function FriendsSkeleton({ isFriends } : { isFriends?: boolean }) {
  return (
    <div className="py-2 h-full w-full flex flex-col">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="w-full flex items-center justify-between py-2 px-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              {isFriends && <Skeleton className="h-4 w-[60px]" />}
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-7" />
            <Skeleton className="h-7 w-7" />
          </div>
        </div>
      ))}
    </div>
  )
}

export {
    FriendsSkeleton
}
