"use client";

import React from 'react';
import AuthGuard from '../../../components/AuthGuard';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function Page() {
  const { dictionary } = useLanguage();
  if (!dictionary)
    return null;

  return (
    <AuthGuard>
      <div>
        <h1>history</h1>
      </div>
    </AuthGuard>
  );
}