import '../globals.css';

import type { PageProps, Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from './dictionaries';
import { hasLocale, getDictionary } from './dictionaries';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Bebas_Neue } from 'next/font/google';
import Footer from '../../components/Footer';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
});

export async function getMetadata({ params }: PageProps): Promise<Metadata> {
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
        <main>{children}</main>
        <Footer dictionary={dict} />
      </body>
    </html>
  );
}
