"use client";

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Settings, LogOut } from 'lucide-react';
import SettingsModal from './SettingsModal'
import Nav from './Nav'
Nav
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
    <div className="h-[80px] flex justify-between items-center gap-4 bg-modal-bg backdrop-blur-sm w-full border-b border-white/10 shadow-[0_0_30px] shadow-black/70 px-8">
      <Link href="/">
        <img className="h-6" src="/logo.png" />
      </Link>
      <Nav tabs={[
        { name: dictionary.header.friendsTab, href: "/friends" },
        { name: dictionary.header.playTab, href: "/" },
        { name: dictionary.header.historyTab, href: "/history" }
      ]} />
      <DropdownMenu>
        <DropdownMenuTrigger className="text-sm font-mono rounded-full py-1.5 px-4 bg-white/5 border border-white/10 transition-colors duration-200 cursor-pointer hover:bg-white/10">
          {username}
        </DropdownMenuTrigger>
        <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className="mr-2 bg-white/5 backdrop-blur-sm border border-white/10">
          <DropdownMenuItem className="hover:bg-white/10" onClick={() => openModal(<SettingsModal />)}>
            < Settings />
            {dictionary.header.settings}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={logout}>
            < LogOut />
            {dictionary.header.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}