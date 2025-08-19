"use client";

import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";

type Language = "en" | "ru";

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const t = useTranslations("LanguageSwitcher");
  const languages = {
    en: { name: t("english"), flag: "🇺🇸" },
    ru: { name: t("russian"), flag: "🇷🇺" },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-primary/20 hover:bg-primary/10 hover:border-primary/40 rounded-xl bg-transparent transition-all duration-300"
        >
          <Globe className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">
            {languages[currentLanguage].name}
          </span>
          <span className="sm:hidden">{languages[currentLanguage].flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-card/95 border-primary/20 rounded-xl backdrop-blur-xl"
      >
        {Object.entries(languages).map(([code, lang]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => onLanguageChange(code as Language)}
            className={`hover:bg-primary/10 cursor-pointer rounded-lg transition-colors duration-200 ${
              currentLanguage === code ? "bg-primary/5 text-primary" : ""
            }`}
          >
            <span className="mr-3 text-lg">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
