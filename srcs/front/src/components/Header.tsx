"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Menu, X, Settings, LogOut } from 'lucide-react';
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
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { name: dictionary.header.leaderboardTab, href: "/leaderboard" },
    { name: dictionary.header.friendsTab, href: "/friends" },
    { name: dictionary.header.playTab, href: "/" },
    { name: dictionary.header.historyTab, href: "/history" }
  ];

  const cleanedPath = pathname.replace(`/${lang}`, '') || '/';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  if (!isAuthenticated) {
    return (
      <header className="z-30 h-[64px] flex items-center w-full px-4 sm:px-6 md:px-8">
        <Link href={`/${lang}`}>
          <img className="h-5 sm:h-6" src="/logo.png" />
        </Link>
      </header>
    );
  }

  return (
    <>
      <header className="relative z-30 h-[64px] flex justify-between items-center gap-2 sm:gap-3 bg-modal-bg backdrop-blur-xl w-full px-3 sm:px-6 md:px-8 border-b border-white/10 shadow-[0_0_30px] shadow-black/70">
        <Link href={`/${lang}`}>
          <img className="h-5 sm:h-6" src="/logo.png" />
        </Link>

        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 w-fit h-full max-h-full">
          <Nav tabs={tabs} />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md transition-colors duration-200 hover:bg-white/10 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-mono rounded-full py-1 pl-1.5 pr-1.5 sm:pr-2.5 bg-white/5 border border-white/10 transition-colors duration-200 cursor-pointer hover:bg-white/10">
              <ProfilePicture profilePictureUrl={profilePictureUrl} size={7} />
              <span className="hidden sm:inline">{username}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()} className="mr-1 sm:mr-2 bg-white/5 backdrop-blur-xl border border-white/10">
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

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-modal-bg/95 backdrop-blur-xl border-t border-white/10">
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
            <Link href={`/${lang}`} onClick={() => setIsMobileMenuOpen(false)}>
              <img className="h-5" src="/logo.png" />
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/10 transition-colors duration-200 cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="h-[calc(100dvh-4rem)] overflow-y-auto">
            <div className="flex flex-col w-full">
              {tabs.map((tab) => {
                const isActive = cleanedPath === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={`/${lang}${tab.href === '/' ? '' : tab.href}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "relative flex items-center min-h-14 px-4 py-3 border-l-2 text-base uppercase font-semibold transition-colors duration-200",
                      isActive
                        ? "border-primary text-white bg-linear-to-r from-primary-30 to-transparent"
                        : "border-transparent text-sub-text hover:text-white hover:border-white/80 hover:bg-linear-to-r hover:from-white/10 hover:to-transparent"
                    )}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}