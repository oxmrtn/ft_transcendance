import '../globals.css';

import type { PageProps, Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from './dictionaries';
import { GeistSans } from 'geist/font/sans';
import { hasLocale, getDictionary } from './dictionaries';
import Footer from '../../components/Footer';

export async function getMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang))
    notFound();
  const dict = await getDictionary(lang);

  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  }
}

export default function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: { lang: Locale }
}) {
  return (
    <html lang={lang}>
      <body className={GeistSans.className}>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
