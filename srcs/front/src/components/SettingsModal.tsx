"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Upload } from 'lucide-react';
import { TextInput } from './ui/Input';
import { FormEvent } from 'react';
import { API_URL } from '../lib/utils';
import Button from './ui/Button';
import { toast } from 'sonner';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function SettingsModal() {
  const { username: actualUsername, email: actualEmail, profilePictureUrl: actualProfilePictureUrl, token, setProfile, logout } = useAuth();
  const { dictionary } = useLanguage();
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(actualProfilePictureUrl || null);
  const [fileInputId] = useState<string>("profile-picture-input");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(dictionary.settings.pictureSizeError);
        return;
      }

      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        toast.error(dictionary.settings.pictureFormatError);
        return;
      }

      setProfilePicture(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    event.preventDefault();

    const formData = new FormData();
    if (username !== actualUsername && username !== "")
      formData.append("username", username);
    if (email !== actualEmail && email !== "")
      formData.append("email", email);
    if (password !== "")
      formData.append("password", password);
    if (profilePicture)
      formData.append("picture", profilePicture);

    if (formData.keys().next().value === undefined) {
      toast.error(dictionary.settings.noChangesToUpdate);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/profile/update`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (response.status === 401) {
        setIsLoading(false);
        logout();
        toast.error(dictionary.common.sessionExpired);
        return;
      }

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || dictionary.common.errorOccurred);

      const nextProfilePictureUrl = data.profilePictureUrl
        ? `${data.profilePictureUrl}?t=${Date.now()}`
        : null;

      setProfile({
        username: data.username,
        email: data.email,
        profilePictureUrl: nextProfilePictureUrl,
      });

      toast.success(dictionary.settings.profileUpdated);
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="w-[400px] sm:w-[440px] md:w-[520px] gradient-background rounded-xl border border-white/10 shadow-[0_0_40px] shadow-black/80 overflow-hidden">
      <div className="bg-black/40 flex items-center justify-between px-5 py-3 relative border-b border-white/10">
        <h1>{dictionary.settings.title}</h1>
        <button className="p-1 bg-white/0 rounded-md hover:bg-white/10 cursor-pointer transition-colors duration-200" onClick={closeModal}>
          <X className="size-6" />
        </button>
        <div className="grid-gradient absolute top-0 left-0 w-full h-full"></div>
      </div>
      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
        <div className="flex items-center gap-4 border border-white/10 rounded-lg bg-black/30 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-sub-text" />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-sm font-medium text-sub-text">{dictionary.settings.profilePicture}</p>
            <button
              type="button"
              className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-md border border-white/10 bg-white/5 text-sm text-sub-text hover:bg-white/10 transition-colors duration-200 cursor-pointer"
              onClick={() => {
                const input = document.getElementById(fileInputId) as HTMLInputElement | null;
                input?.click();
              }}
            >
              <Upload className="w-4 h-4" />
              <span>{dictionary.settings.updateProfilePicture}</span>
            </button>
            <p className="text-sm text-muted-text">{dictionary.settings.profilePictureHint}</p>
          </div>
        </div>
        <input
          id={fileInputId}
          type="file"
          accept="image/png, image/jpeg"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="border border-white/10 rounded-lg bg-black/20 px-4 py-4 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:gap-3 gap-3">
            <div className="flex-1 flex flex-col">
              <TextInput
                placeholder={actualUsername || ""}
                label={dictionary.settings.username}
                id="username-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <TextInput
                placeholder={actualEmail || ""}
                label={dictionary.settings.email}
                id="email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <TextInput
              placeholder={dictionary.settings.newPasswordPlaceholder}
              label={dictionary.settings.password}
              id="password-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>
        <Button fullWidth={true} disabled={isLoading} type="submit" variant="primary" >
          {isLoading ? dictionary.settings.loading : dictionary.settings.update}
        </Button>
      </form>
    </div>
  );
}