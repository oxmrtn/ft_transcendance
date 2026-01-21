import { cn } from '../lib/utils';

export interface User {
    username: string;
    online: boolean;
}

export default function UserProfile({
    user,
    display
} : {
    user: User,
    display: "friendsList" | "pendingList" | "playRoom"
}) {
    if (!user)
        throw new Error("Missing user prop");
    if (!display)
        throw new Error("Missing display prop");
    if (display != "friendsList" && display != "pendingList" && display != "playRoom")
        throw new Error("Invalid display prop");

    return (
        <div className={cn(
            "flex items-center justify-between py-2 px-4 gap-4 rounded-md transition-colors duration-200 hover:bg-white/5",
            display === "playRoom" ? "w-fit" : "w-full"
        )}>
            <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-white" />
            <div className="flex flex-col justify-evenly">
                <p className={cn(
                "font-mono text-semibold"
                )}>
                {user.username}
                </p>
                <div className="flex gap-2 items-center">
                <div className={cn(
                    "h-2.5 w-2.5 rounded-full flex items-center justify-center",
                    user.online ? "bg-green/20" : "bg-destructive/30"
                )}>
                    <div className={cn(
                    "h-1.5 w-1.5 rounded-full"  ,
                    user.online ? "bg-green" : "bg-destructive"
                    )}></div>
                </div>
                <p className={cn(
                    "text-sm text-muted-text"
                )}>
                    {user.online ? "En ligne" : "Hors ligne"}
                </p>
                </div>
            </div>
            </div>
            {display != "playRoom" && (
                <div className="flex gap-2">
                    <div className="h-6 w-6 bg-white" />
                    <div className="h-6 w-6 bg-white" />
                </div>
            )}
        </div>
    );
}