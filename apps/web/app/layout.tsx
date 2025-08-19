import type { Metadata } from "next";
import type React from "react";
import { Geist, Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "./globals.css";

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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title:
      locale === "ru"
        ? "Synoro - Умный помощник для дома"
        : "Synoro - Smart Home Assistant",
    description:
      locale === "ru"
        ? "Ваш интеллектуальный помощник для управления домом и задачами"
        : "Your intelligent assistant for home and task management",
    generator: "v0.app",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geist.variable} ${manrope.variable} antialiased`}
    >
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
