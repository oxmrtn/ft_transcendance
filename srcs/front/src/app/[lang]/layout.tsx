import '../globals.css';

import type { PageProps, Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from './dictionaries';
import { hasLocale, getDictionary } from './dictionaries';
import { GeistSans } from 'geist/font/sans';
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
      <body className={GeistSans.className}>
        <main>{children}</main>
        <Footer dictionary={dict} />
      </body>
    </html>
  );
}
