

import { cn } from '../../../../lib/utils';
import { X, User, EllipsisVertical, MessageCircleMore, Check } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu"
import ProfilePicture from '../../../../components/ProfilePicture';
import { useModal } from '../../../../contexts/ModalContext';
import { ChatModal } from '../../../../components/Chat';
import StatusDot from '../../../../components/StatusDot';

export interface UserType {
    username: string;
    profilePictureUrl: string | null;
    online: boolean | null;
}

export default function UserProfile({
    user,
    display,
    onRemove,
    onAccept
}: {
    user: UserType,
    display: "friendsList" | "pendingList"
    onRemove: () => void;
    onAccept?: () => void;
}) {
    const { dictionary } = useLanguage();
    const { openModal } = useModal();

    if (!user)
        throw new Error("Missing user prop");
    if (!display)
        throw new Error("Missing display prop");
    if (display != "friendsList" && display != "pendingList")
        throw new Error("Invalid display prop");
    if (display === "pendingList" && !onAccept)
        throw new Error("Missing onAccept prop");
    if (!onRemove)
        throw new Error("Missing onRemove prop");

    return (
        <div className={cn(
            "w-full flex items-center justify-between py-3 px-4 gap-4 transition-colors duration-200 hover:bg-white/5",
        )}>
            <div className="flex items-center gap-4">
                <ProfilePicture profilePictureUrl={user.profilePictureUrl} size={12} />
                <div className="flex flex-col justify-evenly">
                    <p className="font-mono text-semibold">{user.username}</p>
                    {user.online !== null && (
                        <div className="flex gap-2 items-center">
                            <StatusDot variant={user.online ? "success" : "fail"} />
                            <p className="text-sm text-muted-text">
                                {user.online ? dictionary.friends.online : dictionary.friends.offline}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <button className="flex items-center justify-center p-1 bg-white/0 rounded-md hover:bg-destructive/20 cursor-pointer transition-colors duration-200 ">
                    <X className="size-5 text-destructive" onClick={onRemove} />
                </button>
                {display === "friendsList" && (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-center p-1 bg-white/0 rounded-md hover:bg-white/10 cursor-pointer transition-colors duration-200">
                            <EllipsisVertical className="size-5 text-white" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className="mr-2 bg-white/5 backdrop-blur-xl border border-white/10">
                            <DropdownMenuItem className="hover:bg-white/10 gap-2.5">
                                <User className="h-4 w-4" />
                                <span className="text-sm">View Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-white/10 gap-2.5" onClick={() => openModal(<ChatModal target={user.username} />, { variant: 'chat', preventClose: true })}>
                                <MessageCircleMore className="h-4 w-4" />
                                <span className="text-sm">Send Message</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                {display === "pendingList" && (
                    <button className="flex items-center justify-center p-1 bg-white/0 rounded-md hover:bg-green/10 cursor-pointer transition-colors duration-200">
                        <Check className="size-5 text-green" onClick={onAccept} />
                    </button>
                )}
            </div>
        </div>
    );
}
