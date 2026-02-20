"use client";

import React from "react";
import ContentWrapper from "../../../../components/ContentWrapper";
import { useLanguage } from "../../../../contexts/LanguageContext";

export default function Page() {
  const { dictionary } = useLanguage();

  return (
    <ContentWrapper title={dictionary.history.title}>
      <div></div>
    </ContentWrapper>
  );
}