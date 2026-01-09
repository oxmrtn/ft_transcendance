"use client";

import React from 'react';
import ContentWrapper from '../../../components/ContentWrapper';
import AuthGuard from '../../../components/AuthGuard';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function Page() {
  const { dictionary } = useLanguage();
  if (!dictionary)
    return null;

  return (
    <AuthGuard>
        <ContentWrapper title="friends">
          <div></div>
        </ContentWrapper>
    </AuthGuard>
  );
}