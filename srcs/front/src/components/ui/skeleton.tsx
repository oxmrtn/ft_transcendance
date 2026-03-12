import { cn } from '../../lib/utils';

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

function GameSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-px border-white/10">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-9 w-32" />
      </div>  
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-black/70 border border-px border-white/10 rounded-md p-2 flex flex-col items-center justify-center gap-2 min-h-[140px] h-full"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="flex justify-center px-4 py-2 border-t border-px border-white/10">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 border border-white/10 rounded-lg bg-black/40 px-4 py-3">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      <div className="border border-white/10 rounded-lg bg-black/30 px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 flex-1 max-w-[60%]">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>

      <div className="border border-white/10 rounded-lg bg-black/30 px-4 py-3 flex justify-between items-center gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="min-w-[120px]">
          <Skeleton className="h-9 w-full" />
        </div>
      </div>

      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export {
  FriendsSkeleton,
  GameSkeleton,
  ProfileSkeleton
}
