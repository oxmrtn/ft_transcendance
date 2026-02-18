"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X } from 'lucide-react';
import { TextInput, FileInput } from './ui/Input';
import { FormEvent } from 'react';
import { API_URL } from '../lib/utils';
import Button from './ui/Button';
import { toast } from 'sonner';

export default function SettingsModal() {
  const { username: actualUsername, email: actualEmail, profilePictureUrl: actualProfilePictureUrl, token, login } = useAuth();
  const { dictionary } = useLanguage();
  const { closeModal } = useModal();

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(actualProfilePictureUrl || null);

  if (!dictionary)
    return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
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
      toast.error("No changes to update");
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

      if (!response.ok) {
        throw new Error(response.statusText || dictionary.settings.unexpectedError);
      }
      const data = await response.json();
      
      if (data.token) {
        login(data.token);
      } else {
        throw new Error(dictionary.settings.unexpectedError);
      }

      toast.success("Profile updated");
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
    <div className="w-[380px] bg-modal-bg rounded-xl border border-white/10 shadow-[0_0_30px] shadow-black/70 overflow-hidden">
      <div className="bg-white/5 flex flex items-center justify-between px-4 py-2 relative border-b border-white/10">
        <h1>Settings</h1>
        <button className="p-1 bg-white/0 rounded-md hover:bg-white/10 cursor-pointer transition-colors duration-200" onClick={closeModal}>
          <X className="size-6" />
        </button>
        <div className="grid-gradient absolute top-0 left-0 w-full h-full"></div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <FileInput
            id="profile-picture-input"
            previewUrl={previewUrl}
            onChange={handleFileChange}
          />
          <div className="flex flex-col gap-0 flex-1">
            <p className="text-sm font-medium text-sub-text">Profile picture</p>
            <p className="text-sm text-muted-text">Must be JPEG or PNG and cannot exceed 10MB.</p>
          </div>
        </div>
        <div className="flex flex-col">
          <TextInput
            placeholder={actualUsername || ""}
            label="Username"
            id="username-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <TextInput
            placeholder={actualEmail || ""}
            label="Email"
            id="email-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <TextInput
            placeholder="New password"
            label="Password"
            id="password-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <Button disabled={isLoading} type="submit" variant="primary">
          {isLoading ? "Loading..." : "Update"}
        </Button>
      </form>
    </div>
  );
}