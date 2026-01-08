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
    <div className={cn(
      "w-full flex flex-col items-center justify-center bg-modal-bg backdrop-blur-sm",
      "md:h-full md:w-fit md:max-w-none md:translate-x-0 md:flex-row md:bg-transparent md:backdrop-blur-none"
    )}>
      {tabs.map((tab, i) => (
        <Link
          key={i}
          href={tab.href} 
          className={cn(
          `w-full flex items-center justify-center py-4 px-6 cursor-pointer transition-colors duration-200 uppercase font-semibold
          border-l-2
          md:border-l-0 md:border-b-2 md:h-full`,
          cleanedPath === tab.href
            ? `border-primary bg-linear-to-r from-primary-30 to-transparent md:bg-linear-to-t`
            : "border-transparent text-muted-text hover:border-white/70 hover:text-sub-text"
        )}>
          {tab.name}
        </Link>
      ))}
    </div>
  );
}