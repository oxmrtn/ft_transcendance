"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Settings, LogOut, Menu, X } from 'lucide-react';
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
  const { dictionary } = useLanguage();
  const { openModal } = useModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showShadow, setShowShadow] = useState(true);
  const pathname = usePathname();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current &&!headerRef.current.contains(event.target as Node))
        setIsMenuOpen(false);
    };

    if (isMenuOpen)
      document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      setShowShadow(false);
    } else {
      const timer = setTimeout(() => {
        setShowShadow(true);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isMenuOpen]);

  if (!isAuthenticated || !dictionary)
    return null;

  return (
    <header className={cn(
      "z-30 h-[64px] flex justify-between items-center gap-4 bg-modal-bg backdrop-blur-xl w-full px-8",
      "md:border-b md:border-white/10 md:shadow-[0_0_30px] md:shadow-black/70",
      showShadow && "shadow-[0_0_30px] shadow-black/70"
    )} ref={headerRef}>
      <Link href="/" className="md:z-auto z-50">
        <img className="h-6" src="/logo.png" />
      </Link>

      <div className={cn(
        "z-20 absolute top-[64px] overflow-hidden left-0 w-full transition-[max-height] duration-400 ease-in-out border-b border-white/10 shadow-[0_20px_20px] shadow-black/30",
        "md:relative md:top-0 md:w-fit md:h-full md:max-h-full md:transition-none md:border-0 md:shadow-none",
        isMenuOpen ? "max-h-96" : "max-h-0",
      )}>
        <Nav tabs={[
          { name: dictionary.header.friendsTab, href: "/friends" },
          { name: dictionary.header.playTab, href: "/" }
        ]} />
      </div>

      <div className="flex items-center gap-4 md:z-auto z-50">
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

        <button
          className="md:hidden p-2 text-white cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}