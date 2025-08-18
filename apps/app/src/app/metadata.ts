import type { Metadata } from "next";

export const TITLE = "Synoro";
export const DESCRIPTION =
  "Интеллектуальный ассистент для управления жизненными событиями, задачами и аналитики. Универсальный цифровой мозг для дома.";

export const defaultMetadata: Metadata = {
  title: {
    template: `%s | ${TITLE}`,
    default: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    "Synoro",
    "умный дом",
    "управление задачами",
    "аналитика",
    "финансы",
    "жизненные события",
    "планирование",
    "telegram бот",
    "OCR",
    "голосовые команды"
  ],
  authors: [{ name: "Synoro Team" }],
  creator: "Synoro",
  publisher: "Synoro",
  metadataBase: new URL("https://synoro.dev"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export const twitterMetadata: Metadata["twitter"] = {
  title: TITLE,
  description: DESCRIPTION,
  card: "summary_large_image",
  site: "@synoro",
  creator: "@synoro",
  images: ["/opengraph-image.png"],
};

export const ogMetadata: Metadata["openGraph"] = {
  title: TITLE,
  description: DESCRIPTION,
  type: "website",
  locale: "ru_RU",
  siteName: TITLE,
  images: [
    {
      url: "/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: "Synoro - Интеллектуальный ассистент для управления жизненными событиями",
    },
  ],
};
