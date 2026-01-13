"use client";

import React from 'react';
import ContentWrapper from '../../../components/ContentWrapper';
import AuthGuard from '../../../components/AuthGuard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/tabs"

export default function Page() {
  const { dictionary } = useLanguage();
  if (!dictionary)
    return null;

  return (
    <AuthGuard>
        <ContentWrapper title="friends">
          <div className="flex items-center justify-center bg-black/20 border-b border-px border-white/10">
            <Tabs defaultValue="friends">
              <TabsList>
                <TabsTrigger value="friends" className="tabs-trigger">friends</TabsTrigger>
                <TabsTrigger value="pending" className="tabs-trigger">pending</TabsTrigger>
              </TabsList>
              <TabsContent value="friends">
              </TabsContent>
              <TabsContent value="pending">
              </TabsContent>
            </Tabs>
          </div>
        </ContentWrapper>
    </AuthGuard>
  );
}