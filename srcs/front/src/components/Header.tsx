"use client";

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Settings, LogOut } from 'lucide-react';
import SettingsModal from './SettingsModal'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu"

export default function Header() {
  const { logout, username, isAuthenticated } = useAuth();
  const { dictionary } = useLanguage();
  const { openModal } = useModal();

  if (!isAuthenticated || !dictionary)
    return null;

  return (
    <div className="flex justify-between items-center gap-4 bg-modal-bg backdrop-blur-sm w-full border-b border-white/10 shadow-[0_0_30px] shadow-black/70 px-8 py-4">
      <Link href="/">
        <img className="h-6" src="/logo.png" />
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger className="text-sm font-mono rounded-full py-2 px-4 bg-white/5 border border-white/10 transition-colors duration-200 cursor-pointer hover:bg-white/10">
          {username}
        </DropdownMenuTrigger>
        <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className="mr-2 bg-white/5 backdrop-blur-sm border border-white/10">
          <DropdownMenuItem className="hover:bg-white/10" onClick={() => openModal(<SettingsModal />)}>
            < Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={logout}>
            < LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}