"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

type Language = "en" | "ru"

interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const languages = {
    en: { name: "English", flag: "🇺🇸" },
    ru: { name: "Русский", flag: "🇷🇺" },
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 rounded-xl"
        >
          <Globe className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{languages[currentLanguage].name}</span>
          <span className="sm:hidden">{languages[currentLanguage].flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-primary/20 rounded-xl">
        {Object.entries(languages).map(([code, lang]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => onLanguageChange(code as Language)}
            className={`cursor-pointer hover:bg-primary/10 rounded-lg transition-colors duration-200 ${
              currentLanguage === code ? "bg-primary/5 text-primary" : ""
            }`}
          >
            <span className="mr-3 text-lg">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
