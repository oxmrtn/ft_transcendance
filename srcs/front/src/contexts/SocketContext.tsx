"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { toast } from "sonner";
import { useRef } from "react";

interface Message {
    content: string;
    sender: string;
    destination: string | null;
    isPrivate: boolean;
    isSender: boolean | null;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadMessagesCount: number;
    messages: Message[];
    connectSocket: (token: string) => void;
    disconnectSocket: () => void;
    setIsChatOpen: (open: boolean) => void;
    setUnreadMessagesCount: (count: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

function SocketProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, token, logout } = useAuth();
    const { dictionary } = useLanguage();
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const isChatOpenRef = useRef(isChatOpen);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const unreadMessagesCountRef = useRef(unreadMessagesCount);

    const disconnectSocket = useCallback((targetSocket?: Socket | null) => {
        const socketToDisconnect = targetSocket ?? socketRef.current;
        if (!socketToDisconnect)
            return;

        socketToDisconnect.removeAllListeners();
        if (socketToDisconnect.connected || socketToDisconnect.active)
            socketToDisconnect.disconnect();

        if (socketRef.current === socketToDisconnect)
            socketRef.current = null;

        setSocket((prev) => (prev === socketToDisconnect ? null : prev));
        setIsConnected(false);
    }, []);

    const connectSocket = useCallback((token: string) => {
        if (socketRef.current)
            return;

        const newSocket = io("/", {
            extraHeaders: { Authorization: `Bearer ${token}` },
            auth: { token: `Bearer ${token}` },
            autoConnect: true,
        });

        newSocket.on("connect", () => {
            setIsConnected(true);
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
        });

        newSocket.on("chat-message", (message: any) => {
            handleNewMessage(message);
        });

        newSocket.on("private-message", (message: any) => {
            handleNewMessage(message);
        });

        newSocket.on("error", (error: any) => {
            if (error?.message === "session-expired") {
                logout();
                toast.error(dictionary.common.sessionExpired);
            } else {
                toast.error(error?.message || "Socket error");
            }
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
    }, [dictionary.common.sessionExpired, logout]);

    useEffect(() => {
        if (isAuthenticated)
            connectSocket(token);
        else
            disconnectSocket();

        return () => {
            disconnectSocket();
        };
    }, [isAuthenticated, token, connectSocket, disconnectSocket]);

    useEffect(() => {
        isChatOpenRef.current = isChatOpen;
    }, [isChatOpen]);

    useEffect(() => {
        unreadMessagesCountRef.current = unreadMessagesCount;
    }, [unreadMessagesCount]);

    const handleNewMessage = (newMessage: Message) => {
        if (!isChatOpenRef.current)
            setUnreadMessagesCount(unreadMessagesCountRef.current + 1);
        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, newMessage];
            return updatedMessages.slice(-100);
        });
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, unreadMessagesCount, messages, connectSocket, disconnectSocket, setUnreadMessagesCount, setIsChatOpen }}>
            {children}
        </SocketContext.Provider>
    );
};

function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

export {
    SocketProvider,
    useSocket
}