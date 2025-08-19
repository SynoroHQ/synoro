import type { Metadata } from "next";
import type { Locale } from "next-intl";
import type React from "react";
import { Geist, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "../../i18n/routing";

import "../globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  props: Omit<Props, "children">,
): Promise<Metadata> {
  const { locale } = await props.params;

  return {
    title:
      locale === "ru"
        ? "Synoro - Умный помощник для дома"
        : "Synoro - Smart Home Assistant",
    description:
      locale === "ru"
        ? "Ваш интеллектуальный помощник для управления домом и задачами"
        : "Your intelligent assistant for home and task management",
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${geist.variable} ${manrope.variable} antialiased`}
    >
      <body className="font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
