"use client";

import ContentWrapper from "../../../components/ContentWrapper";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ScrollArea } from "../../../components/ui/scroll-area";
import FrConditions from "./fr";
import EnConditions from "./en";
import SeConditions from "./se";

export default function Page() {
  const { dictionary, lang } = useLanguage();

  return (
    <ContentWrapper title={dictionary.conditions.title}>
        <ScrollArea className="h-full w-full p-4">
            {lang === "fr" ? <FrConditions /> : lang === "en" ? <EnConditions /> : <SeConditions />}
        </ScrollArea>
    </ContentWrapper>
  );
}
