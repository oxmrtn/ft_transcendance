"use client";

import ContentWrapper from "../../../components/ContentWrapper";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ScrollArea } from "../../../components/ui/scroll-area";
import FrPrivacy from "./fr";
import EnPrivacy from "./en";
import SePrivacy from "./se";

export default function Page() {
  const { dictionary, lang } = useLanguage();

  return (
    <ContentWrapper title={dictionary.privacy.title}>
        <ScrollArea className="h-full w-full p-4">
            {lang === "fr" ? <FrPrivacy /> : lang === "en" ? <EnPrivacy /> : <SePrivacy />}
        </ScrollArea>
    </ContentWrapper>
  );
}
