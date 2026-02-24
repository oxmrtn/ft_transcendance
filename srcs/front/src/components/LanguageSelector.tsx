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
        <SelectTrigger className="w-[164px]">
            <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
            <SelectLabel>{dictionary.footer.languageSelector}</SelectLabel>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            </SelectGroup>
        </SelectContent>
        </Select>
    );
}