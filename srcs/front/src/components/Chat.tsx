"use client";

import { useSocket } from '../contexts/SocketContext';
import { useModal } from '../contexts/ModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createPortal } from 'react-dom';
import { MessageCircleMore } from 'lucide-react';
import { X, Send } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from '../lib/utils';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

type ChatTab = 'all' | 'global' | 'private';

interface ChatModalProps {
    target?: string;
    triggerId?: number;
}

export function ChatModal({ target, triggerId }: ChatModalProps) {
    const { socket, messages, setUnreadMessagesCount, setIsChatOpen } = useSocket();
    const { username } = useAuth();
    const { closeModal } = useModal();
    const { dictionary } = useLanguage();
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState<ChatTab>('all');
    const [privateTabNotification, setPrivateTabNotification] = useState(false);
    const [globalTabNotification, setGlobalTabNotification] = useState(false);
    const messagesAreaRef = useRef<HTMLDivElement>(null);
    const prevMessagesLengthRef = useRef(messages.length);

    const filteredMessages = activeTab === 'all'
        ? messages
        : activeTab === 'global'
        ? messages.filter((m) => !m.isPrivate)
        : messages.filter((m) => m.isPrivate);

    useEffect(() => {
        if (!target || triggerId === undefined)
            return;

        setMessage((prev) => {
            if (!prev)
                return `/w ${target} `;
            if (prev.startsWith(`/w ${target} `))
                return prev;
            if (prev.startsWith('/w ')) {
                const parts = prev.split(' ');
                if (parts.length >= 3) {
                    const content = parts.slice(2).join(' ');
                    return `/w ${target} ${content}`;
                }
                return `/w ${target} `;
            }
            return `/w ${target} ${prev}`;
        });
    }, [target, triggerId]);

    useEffect(() => {
        messagesAreaRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeTab]);

    useEffect(() => {
        setIsChatOpen(true);
        setUnreadMessagesCount(0);
    }, []);

    useEffect(() => {
        if (messages.length <= prevMessagesLengthRef.current) {
            prevMessagesLengthRef.current = messages.length;
            return;
        }
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) {
            prevMessagesLengthRef.current = messages.length;
            return;
        }

        if (lastMessage.isPrivate) {
            if (!lastMessage.isSender && activeTab !== 'private')
                setPrivateTabNotification(true);
        } else {
            if (lastMessage.sender !== username && activeTab !== 'global')
                setGlobalTabNotification(true);
        }

        prevMessagesLengthRef.current = messages.length;
    }, [messages, activeTab]);

    const handleTabChange = (v: string) => {
        const newTab = v as ChatTab;
        setActiveTab(newTab);

        if (newTab === 'private') {
            setPrivateTabNotification(false);
        }
        if (newTab === 'global') {
            setGlobalTabNotification(false);
        }
    };

    const handleSendMessage = (message: string) => {
        const cleanedMessage = message.trim();
        setMessage("");
        if (cleanedMessage === "")
            return;

        if (cleanedMessage.startsWith("/w")) {
            const target = cleanedMessage.split(" ")[1];
            if (!target)
                return;
            const content = cleanedMessage.substring(target.length + 4).trim();
            if (content === "")
                return;

            socket?.emit('private-message', {
                target,
                content
            });
        } else {
            socket?.emit('chat-message', { content: cleanedMessage });
        }
    }

    return (
        <div className="w-[300px] bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_0_30px] shadow-black/70">
            <div className="flex p-2 w-full items-center justify-between gap-2 border-b border-white/10">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="flex gap-2">
                        <TabsTrigger value="all" className="text-xs py-1 px-2">
                            {dictionary.chat.tabAll}
                        </TabsTrigger>
                        <TabsTrigger
                            value="global"
                            className={cn("text-xs py-1 px-2 !relative", globalTabNotification && "animate-pulse bg-primary/20")}
                        >
                            {dictionary.chat.tabGlobal}
                            {globalTabNotification && (
                                <div className="absolute top-[-4px] right-[-4px] h-2.5 w-2.5 rounded-full flex items-center justify-center bg-primary/20">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                </div>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="private"
                            className={cn("text-xs py-1 px-2 !relative", privateTabNotification && "animate-pulse bg-primary/20")}
                        >
                            {dictionary.chat.tabPrivate}
                            {privateTabNotification && (
                                <div className="absolute top-[-4px] right-[-4px] h-2.5 w-2.5 rounded-full flex items-center justify-center bg-primary/20">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                </div>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <button onClick={() => {
                    closeModal();
                    setIsChatOpen(false);
                }}>
                    <X className="size-5 text-white hover:text-white/50 cursor-pointer transition-colors duration-200" />
                </button>
            </div>
            <div className="p-2">
                <ScrollArea className="w-full h-[120px]">
                    {filteredMessages.map((message, index) => (
                        <div className="pr-3" key={index}>
                            <p className="text-sm break-all">
                                <span className={message.isPrivate ? "text-private-message-sender" : "text-global-message-sender"}>
                                    {message.isPrivate ? (message.isSender ? `${dictionary.chat.to} ${message.destination}` : `${dictionary.chat.from} ${message.sender}`) : message.sender}:
                                </span>
                                <span> {message.content}</span>
                            </p>
                        </div>
                    ))}
                    <div ref={messagesAreaRef} />
                </ScrollArea>
            </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(message);
            }}>
                <div className="flex border-t bg-white/10 backdrop-blur-xl border-white/10">
                    <input type="text" className="text-sm w-full py-1 px-2 border-none outline-none" placeholder={dictionary.chat.messagePlaceholder} value={message} onChange={(e) => setMessage(e.target.value)} />
                    <button type="submit" className="py-1 px-2">
                        <Send className="size-4 text-white hover:text-white/50 cursor-pointer transition-colors duration-200" />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Chat() {
    const { unreadMessagesCount } = useSocket();
    const { openModal, isOpen } = useModal();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated || isOpen)
        return null;

    return createPortal(
        (<div className="fixed top-1/2 left-[16px]">
            <div className="relative">
                {unreadMessagesCount > 0 && (
                    <>
                        <div className="animate-pulse absolute top-0 right-0 bg-primary size-4 flex items-center justify-center rounded-full"></div>
                        <div className="px-1 z-10 absolute top-0 right-0 bg-primary flex items-center justify-center rounded-full">
                            <p className="text-white text-xs font-mono">
                                {unreadMessagesCount}
                            </p>
                        </div>
                    </>
                )}
                <button
                    className="bg-white/10 p-4 rounded-full backdrop-blur-xl border border-white/10 shadow-[0_0_30px] shadow-black/70 cursor-pointer hover:bg-white/20 transition-colors duration-200"
                    onClick={() => openModal(<ChatModal />, { variant: 'chat', preventClose: true })}>
                    <MessageCircleMore size={24} />
                </button>
            </div>
        </div>),
        document.body
    );
}
