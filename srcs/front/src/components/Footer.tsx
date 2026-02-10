"use client";

import Link from 'next/link';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { dictionary } = useLanguage();
  if (!dictionary)
    return null;

  return (
    <footer className="flex flex-col items-center gap-4 bg-modal-bg backdrop-blur-xl w-full border-t border-white/10 shadow-[0_0_30px] shadow-black/70 px-8 py-4
    md:flex-row md:justify-between md:gap-2">
      <LanguageSelector />
      <div className="flex gap-4">
        <Link href="#" className="secondary-link">{dictionary.footer.privacyPolicy}</Link>
        <Link href="#" className="secondary-link">{dictionary.footer.termsOfService}</Link>
      </div>
    </footer>
  );
}