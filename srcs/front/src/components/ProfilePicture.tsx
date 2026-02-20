import { User } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProfilePicture({
    profilePictureUrl,
    size
}: { profilePictureUrl: string | null
    size: number
}) {
  return (
    <div className={cn(
        "rounded-full bg-white/5 border border-white/5 transition-colors duration-200 overflow-hidden flex items-center justify-center",
        `w-${size} h-${size}`,
        !profilePictureUrl && "p-1"
    )}>
      {profilePictureUrl ? (
        <img src={profilePictureUrl} className="w-full h-full object-cover" />
      ) : (
        <User className="size-full" />
      )}
    </div>
  );
}
