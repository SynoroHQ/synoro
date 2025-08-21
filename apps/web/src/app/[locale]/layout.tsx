import type { Metadata } from "next";
import type { Locale } from "next-intl";
import type React from "react";
import { Geist, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Script from "next/script";
import YandexMetrika from "../../components/analytics/YandexMetrika";

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

const YM_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

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
        {YM_ID ? <YandexMetrika /> : null}
        {YM_ID ? (
          <>
            <Script
              id="ym-loader"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html:
                  "(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,\"script\",\"https://mc.yandex.ru/metrika/tag.js\",\"ym\");",
              }}
            />
            <Script id="ym-init" strategy="afterInteractive">{`
              if (typeof ym === 'function') {
                ym(${Number(YM_ID)}, 'init', {
                  clickmap: true,
                  trackLinks: true,
                  accurateTrackBounce: true,
                  webvisor: true
                });
              }
            `}</Script>
            <noscript>
              <div>
                <img
                  src={`https://mc.yandex.ru/watch/${YM_ID}`}
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        ) : null}
      </body>
    </html>
  );
}
