'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Divider from '../../../../components/ui/Divider';
import Button from '../../../../components/ui/Button';
import { TextInput } from '../../../../components/ui/Input';
import { Loader2Icon } from "lucide-react"
import { useLanguage } from '../../../../contexts/LanguageContext';
import { API_URL } from '../../../../lib/utils';

export default function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { dictionary } = useLanguage();
  if (!dictionary)
    return null;

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError(null);
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || dictionary.register.unexpectedError);
      }

      if (data.token) {
        login(data.token);
        router.push('/');
      } else {
        throw new Error(dictionary.register.unexpectedError);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="w-md flex flex-col justify-center relative items-center gap-4 px-8">
      <div className="grid-gradient"></div>
      <img className="h-10 opacity-[.1] md:hidden" src="/logo.png" />
      <div className="w-full relative flex items-center justify-center">
        <Link href="login" className="absolute left-0">
          <ArrowLeft />
        </Link>
        <h1>VersuS Code</h1>
      </div>
      <Divider text={dictionary.register.dividerText} />
      <div className="w-full flex flex-col gap-2">
        <TextInput
          disabled={isLoading}
          required={true}
          placeholder={dictionary.register.usernamePlaceholder}
          id="username-input"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <TextInput
          disabled={isLoading}
          required={true}
          placeholder={dictionary.register.emailPlaceholder}
          id="email-input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <TextInput
          disabled={isLoading}
          required={true}
          placeholder={dictionary.register.passwordPlaceholder}
          id="password-input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <Button disabled={isLoading} fullWidth={true} type="submit" variant="primary">
          {isLoading ? dictionary.register.loadingButton : dictionary.register.registerButton}
          {isLoading && <Loader2Icon className="size-4 animate-spin" />}
        </Button>
      </div>
    </form>
  );
}
