"use client"

import * as React from "react"
import { useParams, usePathname, useRouter } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./Select"

export default function LanguageSelector({ dictionary: dict }: { dictionary: any }) {
    if (!dict)
        throw new Error("Missing dictionnary");

    const params = useParams();
    const lang = params.lang;
    const pathname = usePathname();
    const router = useRouter();

    const handleLanguageChange = (newLang: string) => {
        const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
        router.push(newPath);
    };

    return (
        <Select onValueChange={handleLanguageChange} defaultValue={lang as string}>
        <SelectTrigger className="bg-modal-bg border border-white/10 w-[164px] transition-colors duration-200 cursor-pointer
        hover:bg-white/5">
            <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent className="bg-modal-bg backdrop-blur-md border border-white/10">
            <SelectGroup>
            <SelectLabel>{dict.footer.languageSelector}</SelectLabel>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            </SelectGroup>
        </SelectContent>
        </Select>
    );
}