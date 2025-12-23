import type { PageProps } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { hasLocale, getDictionary } from './dictionaries';
 
export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang))
    notFound();
  const dict = await getDictionary(lang);

  return (
    <Link href="/login" className="primary-link">{dict.login.loginButton}</Link>
  );
}