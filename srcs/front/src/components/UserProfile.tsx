

import { cn } from '../lib/utils';
import { X, User, EllipsisVertical, MessageCircleMore, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./dropdown-menu"

export interface User {
    username: string;
    online: boolean | undefined;
}

export default function UserProfile({
    user,
    display,
    onRemove,
    onAccept
}: {
    user: User,
    display: "friendsList" | "pendingList"
    onRemove: () => void;
    onAccept?: () => void;
}) {
    const { dictionary } = useLanguage();
    if (!dictionary)
        return null;
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
            "w-full flex items-center justify-between py-2 px-4 gap-4 transition-colors duration-200 hover:bg-white/5",
        )}>
            <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-white" />
                <div className="flex flex-col justify-evenly">
                    <p className="font-mono text-semibold">{user.username}</p>
                    {user.online !== undefined && (
                        <div className="flex gap-2 items-center">
                            <div className={cn(
                                "h-2.5 w-2.5 rounded-full flex items-center justify-center",
                                user.online ? "bg-green/20" : "bg-destructive/30"
                            )}>
                                <div className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    user.online ? "bg-green" : "bg-destructive"
                                )}></div>
                            </div>
                            <p className={cn(
                                "text-sm text-muted-text"
                            )}>
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
                            <DropdownMenuItem className="hover:bg-white/10 gap-2.5">
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