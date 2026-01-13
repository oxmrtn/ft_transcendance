import '../globals.css';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from './dictionaries';
import { hasLocale, getDictionary } from './dictionaries';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Bebas_Neue } from 'next/font/google';
import { AuthProvider } from '../../contexts/AuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { ModalProvider } from '../../contexts/ModalContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
});

export async function getMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang))
    notFound();
  const dict = await getDictionary(lang);

  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
    viewport: {
      width: 'device-width',
      initialScale: 1
    }
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params;
  if (!hasLocale(lang))
    notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang}>
      <body className={`${GeistSans.className} ${GeistMono.variable} ${bebas.variable}`}>
        <AuthProvider>
          <LanguageProvider initialLang={lang} initialDictionary={dict}>
            <ModalProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </ModalProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
