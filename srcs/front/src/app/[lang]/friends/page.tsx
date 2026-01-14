"use client";

import { useState } from 'react';
import React from 'react';
import ContentWrapper from '../../../components/ContentWrapper';
import AuthGuard from '../../../components/AuthGuard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/tabs"
import { TextInput } from '../../../components/Input';
import Button from '../../../components/Button';


export default function Page() {
  const { isAuthenticated } = useAuth();
  const { dictionary } = useLanguage();
  const [isWaiting, setIsWaiting] = useState(true);

  if (!isAuthenticated || !dictionary)
    return null;

  return (
    <AuthGuard>
      <ContentWrapper title="friends">
        <Tabs defaultValue="friends">
          <TabsList className="flex items-center justify-center bg-black/20 border-b border-px border-white/10">
            <TabsTrigger value="friends" className="tabs-trigger">friends</TabsTrigger>
            <TabsTrigger value="pending" className="tabs-trigger">pending</TabsTrigger>
          </TabsList>
          <TabsContent value="friends">
            <div className="flex justify-between items-center fixed bottom-0 left-0 w-full p-4 border-t border-px border-white/10">
              <div className="flex gap-2">
                <TextInput customWidth="w-[174px]" placeholder="Search for a player" id="search-friend"/>
                <Button variant="primary" onClick={() => {}}>add</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="pending">
          </TabsContent>
        </Tabs>
      </ContentWrapper>
    </AuthGuard>
  );
}