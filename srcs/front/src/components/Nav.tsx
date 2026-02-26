"use client";

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';

interface Tab {
  name: string;
  href: string;
}

interface NavProps {
  tabs: Tab[];
}
  
export default function Nav({ tabs }: NavProps) {
  const { isAuthenticated } = useAuth();
  const { lang, dictionary } = useLanguage();
  const pathname = usePathname();

  if (!isAuthenticated || !dictionary)
    return null;

  if (!tabs || tabs.length === 0)
    throw new Error("Missing tabs prop");

  const cleanedPath = pathname.replace(`/${lang}`, '') || '/';

  return (
    <div className=
      "flex h-full">
      {tabs.map((tab, i) => (
        <Link
          key={i}
          href={`/${lang}${tab.href === '/' ? '' : tab.href}`}
          className={cn(
          "w-full flex items-center justify-center py-4 px-6 cursor-pointer transition-colors duration-200 uppercase font-semibold border-b-2 h-full",
          cleanedPath === tab.href
            ? "border-primary from-primary-30 to-transparent bg-linear-to-t"
            : "border-transparent text-muted-text hover:border-white/70 hover:text-sub-text"
        )}>
          {tab.name}
        </Link>
      ))}
    </div>
  );
}