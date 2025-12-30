import type { PageProps } from 'next';
import { hasLocale, getDictionary } from '../dictionaries';
import { notFound } from 'next/navigation';
import LoginForm from './LoginForm';
import Footer from '../../../components/Footer';

export default async function LoginPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang))
    notFound();
  const dict = await getDictionary(lang);
  
  return (
    <div className="h-full w-full flex items-center justify-center px-4">
      <div className="flex bg-modal-bg border border-white/10 rounded-xl overflow-hidden">
        <div className="hidden sm:flex w-2xs items-center justify-center border border-white/10 rounded-xl noise-mesh-bg -m-px">
          <img className="h-24 opacity-[.5] mix-blend-overlay" src="/logo.png" />
        </div>
        <LoginForm dictionary={dict} />
      </div>
    </div>
  );
}