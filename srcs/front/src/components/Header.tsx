"use client";

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Settings, LogOut } from 'lucide-react';

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
  const { dictionary } = useLanguage();
  if (!dictionary)
    return null;

  const { logout, username, isAuthenticated } = useAuth();
  if (!isAuthenticated)
    return null;

  const { openModal } = useModal();

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
          <DropdownMenuItem className="hover:bg-white/10" onClick={() => openModal(<div className="h-20 w-20 bg-red">eee</div>)}>
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