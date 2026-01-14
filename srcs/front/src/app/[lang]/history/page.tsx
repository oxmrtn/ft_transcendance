"use client";

import React from 'react';
import AuthGuard from '../../../components/AuthGuard';
import ContentWrapper from '../../../components/ContentWrapper';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function Page() {
  const { isAuthenticated } = useAuth();
  const { dictionary } = useLanguage();

  if (!isAuthenticated || !dictionary)
    return null;

  return (
    <AuthGuard>
      <ContentWrapper title="history">
        <div></div>
      </ContentWrapper>
    </AuthGuard>
  );
}