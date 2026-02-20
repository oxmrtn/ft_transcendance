"use client";

import { GameProvider } from "../../../../contexts/GameContext";

export default function PlayLayout({ children }: { children: React.ReactNode }) {
    return (
        <GameProvider>
            {children}
        </GameProvider>
    );
}
