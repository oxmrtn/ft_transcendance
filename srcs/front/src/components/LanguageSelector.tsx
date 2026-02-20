"use client"

import * as React from "react"
import { useLanguage } from "../contexts/LanguageContext";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/Select"

export default function LanguageSelector() {
    const { lang, dictionary, changeLanguage } = useLanguage();
    
    return (
        <Select onValueChange={changeLanguage} defaultValue={lang}>
        <SelectTrigger className="bg-white/5 border border-white/10 w-[164px] transition-colors duration-200 cursor-pointer
        hover:bg-white/10">
            <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent className="bg-white/5 backdrop-blur-xl border border-white/10">
            <SelectGroup>
            <SelectLabel>{dictionary.footer.languageSelector}</SelectLabel>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            </SelectGroup>
        </SelectContent>
        </Select>
    );
}