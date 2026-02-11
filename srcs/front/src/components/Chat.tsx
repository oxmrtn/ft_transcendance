"use client";

import { useSocket } from '../contexts/SocketContext';
import { useModal } from '../contexts/ModalContext';
import { createPortal } from 'react-dom';
import { MessageCircleMore } from 'lucide-react';
import { X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

function ChatModal() {
    const { closeModal } = useModal();

    return (
        <div className="w-[300px] bg-white/10 backdrop-blur-xl border border-white/10">
            <div className="flex p-2 w-full items-center justify-end">
                <button onClick={closeModal}>
                    <X className="size-5 text-white hover:text-white/50 cursor-pointer transition-colors duration-200" />
                </button>
            </div>
            <div className="px-2">
                <ScrollArea className="w-full h-[120px]">
                    test<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                    text<br />
                </ScrollArea>
            </div>
        </div>
    );
}

export default function Chat() {
    const { socket } = useSocket();
    const { openModal, isOpen } = useModal();

    if (isOpen)
        return null;

    return createPortal(
        (<button
            className="fixed top-1/2 left-[16px] bg-white/10 p-4 rounded-full backdrop-blur-xl border border-white/10 shadow-[0_0_30px] shadow-black/70 cursor-pointer hover:bg-white/20 transition-colors duration-200"
            onClick={() => openModal(<ChatModal />, { variant: 'chat', preventClose: true })}>
            <MessageCircleMore size={24} />
        </button>),
        document.body
    );
}
