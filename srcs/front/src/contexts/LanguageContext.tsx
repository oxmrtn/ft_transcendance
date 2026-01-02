"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { type Locale, hasLocale } from '../app/[lang]/dictionaries';

interface LanguageContextType {
  lang: Locale;
  dictionary: any;
  changeLanguage: (lang: string) => void;
}

interface LanguageProps {
  children: ReactNode;
  initialLang: Locale;
  initialDictionary: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function LanguageProvider({children, initialLang, initialDictionary}: LanguageProps) {
  const [lang, setLang] = useState<Locale>(initialLang);
  const [dictionary, setDictionary] = useState(initialDictionary);
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLang: string) => {
    if (hasLocale(newLang) && newLang !== lang) {
      const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
      router.push(newPath);
    }
  };
  
  useEffect(() => {
    setDictionary(initialDictionary);
    setLang(initialLang);
  }, [initialLang, initialDictionary]);

  return (
    <LanguageContext.Provider value={{ lang, dictionary, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export {
  LanguageProvider,
  useLanguage
}