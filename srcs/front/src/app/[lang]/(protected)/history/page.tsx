"use client";

import React from 'react';
import ContentWrapper from '../../../../components/ContentWrapper';
import { useLanguage } from '../../../../contexts/LanguageContext';

export default function Page() {
  const { dictionary } = useLanguage();

  if (!dictionary)
    return null;

  return (
      <ContentWrapper title="history">
        <div></div>
      </ContentWrapper>
  );
}