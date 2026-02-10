"use client";

import React from 'react';
import AuthGuard from '../../../components/AuthGuard';
import ContentWrapper from '../../../components/ContentWrapper';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function Page() {
  const { dictionary } = useLanguage();

  if (!dictionary)
    return null;

  return (
      <ContentWrapper title="play">
        <div></div>
      </ContentWrapper>
  );
}