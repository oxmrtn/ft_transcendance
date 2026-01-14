"use client";

import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function SettingsModal() {
  const { logout, username, isAuthenticated } = useAuth();
  const { dictionary } = useLanguage();
  const { closeModal } = useModal();

  if (!isAuthenticated || !dictionary)
    return null;

  return (
    <div></div>
  );
}