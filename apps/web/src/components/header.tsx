"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@synoro/ui";

export default function Header() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-2 left-1/2 z-50 w-full max-w-6xl -translate-x-1/2 transform px-2 sm:top-4 sm:px-4">
      <div className="glass-effect border-primary/20 flex items-center justify-between rounded-xl border bg-white/95 px-4 py-3 backdrop-blur-xl transition-all duration-300 hover:bg-white/98 sm:rounded-2xl sm:px-6 sm:py-4">
        <div className="flex items-center">
          <div className="gradient-text group relative cursor-pointer font-serif text-xl font-bold transition-transform duration-300 sm:text-2xl">
            Synoro
            <div className="from-primary/20 to-accent/20 absolute -inset-2 -z-10 rounded-xl bg-gradient-to-r opacity-0 blur transition-opacity duration-300 group-hover:opacity-100"></div>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex lg:gap-8">
          <a
            href="#features"
            className="hover:text-primary group relative text-gray-700 transition-colors duration-300"
          >
            {t("features")}
            <span className="from-primary to-accent absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#pricing"
            className="hover:text-primary group relative text-gray-700 transition-colors duration-300"
          >
            {t("pricing")}
            <span className="from-primary to-accent absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#for-whom"
            className="hover:text-primary group relative text-gray-700 transition-colors duration-300"
          >
            {t("about")}
            <span className="from-primary to-accent absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button className="from-primary to-accent group relative hidden overflow-hidden rounded-xl border-2 border-gray-800/20 bg-gradient-to-r px-4 py-2 text-sm font-semibold text-gray-900 backdrop-blur-sm transition-all duration-300 hover:border-gray-800/40 sm:flex sm:items-center sm:px-6 sm:py-3 sm:text-base">
            <span className="relative z-10 flex items-center text-gray-900 drop-shadow-sm">
              {t("joinBeta")}
            </span>
            <div className="from-accent to-primary absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="absolute inset-0 rounded-xl bg-gray-800/10 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-50"></div>
          </Button>

          {/* Mobile menu button */}
          <button
            className="rounded-lg border border-gray-200 bg-white/80 p-2 backdrop-blur-sm transition-all duration-300 hover:bg-white/90 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-700" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="mt-2 md:hidden">
          <div className="glass-effect border-primary/20 space-y-3 rounded-xl border bg-white/95 p-4 backdrop-blur-xl">
            <a
              href="#features"
              className="hover:text-primary hover:bg-primary/5 block rounded-lg px-3 py-2 text-gray-700 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("features")}
            </a>
            <a
              href="#pricing"
              className="hover:text-primary hover:bg-primary/5 block rounded-lg px-3 py-2 text-gray-700 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("pricing")}
            </a>
            <a
              href="#for-whom"
              className="hover:text-primary hover:bg-primary/5 block rounded-lg px-3 py-2 text-gray-700 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("about")}
            </a>
            <div className="border-t border-gray-200/50 pt-2">
              <Button className="from-primary to-accent group relative w-full overflow-hidden rounded-xl border-2 border-gray-800/20 bg-gradient-to-r py-3 font-semibold text-gray-900 backdrop-blur-sm transition-all duration-300 hover:border-gray-800/40">
                <span className="relative z-10 text-gray-900 drop-shadow-sm">
                  {t("joinBeta")}
                </span>
                <div className="from-accent to-primary absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="absolute inset-0 rounded-xl bg-gray-800/10 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-50"></div>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
