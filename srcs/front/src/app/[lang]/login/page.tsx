import type { PageProps } from 'next';
import { hasLocale, getDictionary } from '../dictionaries';
import { notFound } from 'next/navigation';
import LoginForm from './LoginForm';
import LoginWrapper from '../../../components/LoginWrapper';

export default async function LoginPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang))
    notFound();
  const dict = await getDictionary(lang);
  
  return (
    <LoginWrapper >
      <LoginForm dictionary={dict} />
    </LoginWrapper >
  );
}