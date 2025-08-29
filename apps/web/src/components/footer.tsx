import { useTranslations } from "next-intl";

import { Badge, Button } from "@synoro/ui";

export default function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/modern-geometric-pattern.png')] opacity-15" />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-float absolute top-10 left-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        <div
          className="animate-float absolute right-10 bottom-10 h-48 w-48 rounded-full bg-white/5 blur-2xl"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 px-4 py-12 sm:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-3 flex items-center sm:mb-4">
                <div className="gradient-text font-serif text-2xl font-bold transition-transform duration-300 hover:scale-105 sm:text-3xl">
                  Synoro
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-gray-400 sm:mb-6 sm:text-base">
                {t("description")}
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <a
                  href="#"
                  className="hover:bg-primary group flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:scale-110 sm:h-10 sm:w-10"
                  aria-label="Facebook"
                >
                  <svg
                    className="h-4 w-4 text-white group-hover:text-white sm:h-5 sm:w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="hover:bg-primary group flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:scale-110 sm:h-10 sm:w-10"
                  aria-label="Twitter"
                >
                  <svg
                    className="h-4 w-4 text-white group-hover:text-white sm:h-5 sm:w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="hover:bg-primary group flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:scale-110 sm:h-10 sm:w-10"
                  aria-label="Instagram"
                >
                  <svg
                    className="h-4 w-4 text-white group-hover:text-white sm:h-5 sm:w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323C6.001 8.198 7.152 7.708 8.449 7.708s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323c-.875.807-2.026 1.218-3.323 1.218zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.875-.875-1.365-2.026-1.365-3.323s.49-2.448 1.365-3.323c.875-.926 2.026-1.416 3.323-1.416s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-4 text-base font-semibold text-white sm:mb-6 sm:text-lg">
                {t("quickLinks")}
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="#features"
                    className="inline-block text-sm text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white sm:text-base"
                  >
                    {t("features")}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="inline-block text-sm text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white sm:text-base"
                  >
                    {t("pricing")}
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="inline-block text-sm text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white sm:text-base"
                  >
                    {t("aboutUs")}
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="inline-block text-sm text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white sm:text-base"
                  >
                    {t("contact")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-4 text-base font-semibold text-white sm:mb-6 sm:text-lg">
                {t("support")}
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="#help"
                    className="inline-block text-sm text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white sm:text-base"
                  >
                    {t("helpCenter")}
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    className="inline-block text-sm text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white sm:text-base"
                  >
                    {t("privacyPolicy")}
                  </a>
                </li>
                <li>
                  <a
                    href="#terms"
                    className="inline-block text-sm text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white sm:text-base"
                  >
                    {t("termsOfService")}
                  </a>
                </li>
                <li>
                  <a
                    href="#security"
                    className="inline-block text-sm text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white sm:text-base"
                  >
                    {t("security")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="mb-4 text-base font-semibold text-white sm:mb-6 sm:text-lg">
                {t("stayUpdated")}
              </h3>
              <p className="mb-3 text-xs text-gray-400 sm:mb-4 sm:text-sm">
                {t("newsletterDescription")}
              </p>
              <div className="space-y-2 sm:space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    className="focus:ring-primary w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-transparent focus:ring-2 focus:outline-none sm:px-4 sm:py-3 sm:text-base"
                  />
                </div>
                <Button className="w-full rounded-xl bg-white py-2 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-xl sm:py-3 sm:text-base">
                  {t("subscribe")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10 px-4 py-4 sm:py-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
            <div className="text-xs text-gray-400 sm:text-sm">
              {t("copyright")}
            </div>
            <div className="flex flex-col items-center gap-3 text-xs sm:flex-row sm:gap-6 sm:text-sm">
              <a
                href="#status"
                className="text-gray-400 transition-colors duration-300 hover:text-white"
              >
                {t("systemStatus")}
              </a>
              <a
                href="#api"
                className="text-gray-400 transition-colors duration-300 hover:text-white"
              >
                {t("apiDocs")}
              </a>
              <div className="flex items-center gap-1 text-gray-400 sm:gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-[10px] sm:text-xs">
                  {t("allSystemsOperational")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
