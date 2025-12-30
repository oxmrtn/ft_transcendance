'use client';

import { useState, FormEvent } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Divider from '../../../components/Divider';
import Button from '../../../components/Button';
import Input from '../../../components/Input';

export default function LoginForm({ dictionary: dict }: { dictionary: any }) {
  if (!dict)
    throw new Error("Missing dictionnary");

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || dict.login.wrongCredentialsError);
        }

        const data = await response.json();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="w-md relative flex flex-col items-center gap-4 py-12 px-8">
      <div className="grid-gradient"></div>
      <img className="sm:hidden h-12 opacity-[.5] mix-blend-overlay" src="/logo.png" />
      <h1 className="text-xl font-semibold">VersuS Code</h1>
      <Divider text={dict.login.dividerText} />
      <div className="w-full flex flex-col gap-2">
        <Input
          disabled={isLoading}
          placeholder={dict.login.emailPlaceholder}
          name="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          disabled={isLoading}
          placeholder={dict.login.passwordPlaceholder}
          name="password"
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
          {isLoading ? "Connexion ..." : dict.login.loginButton}
        </Button>
      </div>
      <Divider />
      <div className="flex gap-1">
        <p className="text-sub-text">{dict.login.noAccountText}</p>
        <Link href="#" className="primary-link">{dict.login.registerButton}</Link>
      </div>
    </form>
  );
}