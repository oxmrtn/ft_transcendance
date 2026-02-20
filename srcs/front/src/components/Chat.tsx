"use client";

import { useSocket } from '../contexts/SocketContext';
import { useModal } from '../contexts/ModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createPortal } from 'react-dom';
import { MessageCircleMore } from 'lucide-react';
import { X, Send } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useEffect, useState, useRef } from 'react';

export function ChatModal({ target }: { target?: string }) {
    const { socket, messages, setUnreadMessagesCount, setIsChatOpen } = useSocket();
    const { closeModal } = useModal();
    const { dictionary } = useLanguage();
    const [message, setMessage] = useState(target ? `/w ${target}` : "");
    const messagesAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesAreaRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        setIsChatOpen(true);
        setUnreadMessagesCount(0);
    }, []);

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
            socket?.emit('chat-message', message);
        }
    }

    return (
        <div className="w-[300px] bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_0_30px] shadow-black/70">
            <div className="flex p-2 w-full items-center justify-end">
                <button onClick={() => {
                    closeModal();
                    setIsChatOpen(false);
                }}>
                    <X className="size-5 text-white hover:text-white/50 cursor-pointer transition-colors duration-200" />
                </button>
            </div>
            <div className="px-2">
                <ScrollArea className="w-full h-[120px]">
                    {messages.map((message, index) => (
                        <div className="pr-3" key={index}>
                            <p className="text-sm break-all">
                                <span className={message.isPrivate ? "text-private-message-sender" : "text-global-message-sender"}>
                                    {message.isPrivate ? (message.isSender ? `${dictionary?.chat?.to ?? "to"} ${message.destination}` : `${dictionary?.chat?.from ?? "from"} ${message.sender}`) : message.sender}:
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
                    <input type="text" className="text-sm w-full py-1 px-2 border-none outline-none" placeholder={dictionary?.chat?.messagePlaceholder ?? "Message"} value={message} onChange={(e) => setMessage(e.target.value)} />
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

    if (isOpen)
        return null;

    return createPortal(
        (<div className="fixed top-1/2 left-[16px]">
            <div className="relative">
                {unreadMessagesCount > 0 && (
                    <>
                        <div className="absolute top-0 right-0 bg-destructive size-4 flex items-center justify-center rounded-full"></div>
                        <div className="z-10 absolute top-0 right-0 bg-destructive size-4 flex items-center justify-center rounded-full">
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
