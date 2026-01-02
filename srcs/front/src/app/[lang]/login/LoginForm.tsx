'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Divider from '../../../components/Divider';
import Button from '../../../components/Button';
import { TextInput } from '../../../components/Input';
import Spinner from '../../../components/Spinner';

export default function LoginForm({ dictionary: dict }: { dictionary: any }) {
  if (!dict)
    throw new Error("Missing dictionnary");

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError(null);
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:3333/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || dict.login.wrongCredentialsError);
        }

        if (data.token) {
          login(data.token);
          router.push('/');
        } else {
          throw new Error(dict.login.wrongCredentialsError);
        }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="w-md flex flex-col justify-center relative items-center gap-4 px-8">
      <div className="grid-gradient"></div>
      <img className="h-10 opacity-[.1] md:hidden" src="/logo.png" />
      <h1 >VersuS Code</h1>
      <Divider text={dict.login.dividerText} />
      <div className="w-full flex flex-col gap-2">
        <TextInput
          disabled={isLoading}
          required={true}
          placeholder={dict.login.emailPlaceholder}
          id="email-input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <TextInput
          disabled={isLoading}
          required={true}
          placeholder={dict.login.passwordPlaceholder}
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
        <Button disabled={isLoading} fullWidth={true} type="submit" style="primary">
          {isLoading ? dict.register.loadingButton : dict.login.loginButton}
          {isLoading && <Spinner />}
        </Button>
      </div>
      <Divider />
      <div className="flex gap-1">
        <p className="text-sub-text">{dict.login.noAccountText}</p>
        <Link href="register" className="primary-link">{dict.login.registerLink}</Link>
      </div>
    </form>
  );
}