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
    <div className="h-full flex">
      {tabs.map((tab, i) => (
        <Link
          key={i}
          href={tab.href} 
          className={cn(
          "h-full flex items-center justify-center px-6 cursor-pointer transition-colors duration-200 border-b-2 uppercase font-semibold",
          cleanedPath === tab.href
            ? "border-primary current-nav-gradient"
            : "border-transparent text-white/50 hover:border-white/70 hover:text-white/70"
        )}>
          {tab.name}
        </Link>
      ))}
    </div>
  );
}