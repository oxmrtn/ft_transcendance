"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    connectSocket: (token: string) => void;
    disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

function SocketProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (isAuthenticated)
            connectSocket(token);
        else
            disconnectSocket();
        return () => {
            if (socket)
                disconnectSocket();
        };
    }, [isAuthenticated, token]);

    const connectSocket = (token: string) => {
        if (socket)
            return;

        const newSocket = io("https://localhost:8443", {
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

        setSocket(newSocket);
    }

    const disconnectSocket = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
    }

    return (
        <SocketContext.Provider value={{ socket, isConnected, connectSocket, disconnectSocket }}>
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