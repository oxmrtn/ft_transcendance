"use client";

import { useLanguage } from '../contexts/LanguageContext';

export default function ContentWrapper({
  title,
  children 
} : { 
  title: string,
  children: React.ReactNode
}) {
  const { dictionary } = useLanguage();
  if (!dictionary)
    return null;

  if (!title)
    throw new Error("Missing content prop" );

  if (!children)
    throw new Error("Missing children prop");

  return (
    <div className="self-stretch max-w-6xl w-full flex flex-col gap-2">
      <div className="py-4 relative flex items-center justify-center w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-t-xl overflow-hidden shadow-[0_0_30px] shadow-black/70">
        <div className="grid-gradient"></div>
        <h1>
          {title}
        </h1>
      </div>
      <div className="flex-1 bg-modal-bg backdrop-blur-xl border border-white/10 rounded-b-xl overflow-hidden shadow-[0_0_30px] shadow-black/70">
        {children}
      </div>
    </div>
  );
}