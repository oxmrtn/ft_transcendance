import type { PageProps } from 'next';
import { hasLocale, getDictionary } from '../dictionaries';
import { notFound } from 'next/navigation';
import RegisterForm from './RegisterForm';

export default async function LoginPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang))
    notFound();
  const dict = await getDictionary(lang);
  
  return (
    <div className="flex bg-modal-bg backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
      <div className="hidden w-2xs items-center justify-center border border-white/10 rounded-xl gradient-bg -m-px md:flex">
        <img className="h-24 opacity-[.3] mix-blend-overlay" src="/logo.png" />
      </div>
      <RegisterForm dictionary={dict} />
    </div>
  );
}