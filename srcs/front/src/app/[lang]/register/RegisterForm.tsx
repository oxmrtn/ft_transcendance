'use client';

import { useState, FormEvent, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Divider from '../../../components/Divider';
import Button from '../../../components/Button';
import { TextInput, FileInput } from '../../../components/Input';
import Spinner from '../../../components/Spinner';

export default function RegisterForm({ dictionary: dict }: { dictionary: any }) {
  if (!dict)
    throw new Error("Missing dictionnary");

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];

    if (file) {
      const MAX_SIZE_MB = 10;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

      if (file.size > MAX_SIZE_BYTES)
        setFileError(`${dict.register.avatarSizeError} (max ${MAX_SIZE_MB} Mo).`);
      else {
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError(null);
    event.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      const response = await fetch("https://localhost:3333/auth/register", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(dict.register.unexpectedError);
        }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="w-md relative flex flex-col items-center gap-4 py-12 px-8">
      <div className="grid-gradient"></div>
      <Link href="login" className="absolute left-8">
        <ArrowLeft />
      </Link>
      <img className="h-10 opacity-[.1] md:hidden" src="/logo.png" />
      <h1>VersuS Code</h1>
      <Divider text={dict.register.dividerText} />
      <div className="flex items-center gap-4">
        <FileInput
          disabled={isLoading}
          id="avatar-input"
          onChange={handleAvatarChange}
          previewUrl={avatarPreview}
        />
        <div className="flex flex-1 flex-col gap-1 justify-center">
          <p className="text-sub-text">{dict.register.avatarUploadTitle}</p>
          <p className="text-xs text-muted-text">{dict.register.avatarUploadText}</p>
          {fileError && (
            <p className="text-sm text-red-400">{fileError}</p>
          )}
        </div>
      </div>
      <div className="w-full flex flex-col gap-2">
        <TextInput
          disabled={isLoading}
          required={true}
          placeholder={dict.register.usernamePlaceholder}
          id="username-input"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <TextInput
          disabled={isLoading}
          required={true}
          placeholder={dict.register.emailPlaceholder}
          id="email-input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <TextInput
          disabled={isLoading}
          required={true}
          placeholder={dict.register.passwordPlaceholder}
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
          {isLoading ? "Connexion" : dict.register.registerButton}
          {isLoading && <Spinner />}
        </Button>
      </div>
    </form>
  );
}