"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import SettingsModal from './SettingsModal'
import Nav from './Nav'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import ProfilePicture from './ProfilePicture';

export default function Header() {
  const { logout, username, profilePictureUrl, isAuthenticated } = useAuth();
  const { lang, dictionary } = useLanguage();
  const { openModal } = useModal();

  if (!isAuthenticated) {
    return (
      <header className="z-30 h-[64px] flex items-center w-full px-8">
        <Link href={`/${lang}`}>
          <img className="h-6" src="/logo.png" />
        </Link>
      </header>
    );
  }

  return (
    <header className="relative z-30 h-[64px] flex justify-between items-center gap-4 bg-modal-bg backdrop-blur-xl w-full px-8 border-b border-white/10 shadow-[0_0_30px] shadow-black/70">
      <Link href={`/${lang}`}>
        <img className="h-6" src="/logo.png" />
      </Link>

      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-fit h-full max-h-full">
        <Nav tabs={[
          { name: dictionary.header.friendsTab, href: "/friends" },
          { name: dictionary.header.playTab, href: "/" }
        ]} />
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-mono rounded-full py-1 pl-1.5 pr-2.5 bg-white/5 border border-white/10 transition-colors duration-200 cursor-pointer hover:bg-white/10">
            <ProfilePicture profilePictureUrl={profilePictureUrl} size={7} />
            {username}
          </DropdownMenuTrigger>
          <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className="mr-2 bg-white/5 backdrop-blur-xl border border-white/10">
            <DropdownMenuItem className="hover:bg-white/10 gap-2.5" onClick={() => openModal(<SettingsModal />)}>
              < Settings className="h-4 w-4" />
              <span>{dictionary.header.settings}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5" variant="destructive" onClick={logout}>
              < LogOut className="h-4 w-4" />
              <span>{dictionary.header.logout}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}