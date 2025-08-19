import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/modern-geometric-pattern.png')] opacity-15"></div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-float absolute top-10 left-10 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
        <div
          className="animate-float absolute right-10 bottom-10 h-48 w-48 rounded-full bg-white/5 blur-2xl"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="gradient-text mb-4 font-serif text-3xl font-bold transition-transform duration-300 hover:scale-105">
                Synoro
              </div>
              <p className="mb-6 leading-relaxed text-gray-400">
                {t("description")}
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="hover:bg-primary group flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <svg
                    className="h-5 w-5 text-white group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="hover:bg-primary group flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:scale-110"
                  aria-label="Twitter"
                >
                  <svg
                    className="h-5 w-5 text-white group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="hover:bg-primary group flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg
                    className="h-5 w-5 text-white group-hover:text-white"
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
              <h3 className="mb-6 text-lg font-semibold text-white">
                {t("quickLinks")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="inline-block text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    {t("features")}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="inline-block text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    {t("pricing")}
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="inline-block text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    {t("aboutUs")}
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="inline-block text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    {t("contact")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-6 text-lg font-semibold text-white">
                {t("support")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#help"
                    className="inline-block text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    {t("helpCenter")}
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    className="inline-block text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    {t("privacyPolicy")}
                  </a>
                </li>
                <li>
                  <a
                    href="#terms"
                    className="inline-block text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    {t("termsOfService")}
                  </a>
                </li>
                <li>
                  <a
                    href="#security"
                    className="inline-block text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    {t("security")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="mb-6 text-lg font-semibold text-white">
                {t("stayUpdated")}
              </h3>
              <p className="mb-4 text-sm text-gray-400">
                {t("newsletterDescription")}
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    className="focus:ring-primary w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-transparent focus:ring-2 focus:outline-none"
                  />
                </div>
                <Button className="from-primary to-accent hover:from-primary/90 hover:to-accent/90 w-full rounded-xl bg-gradient-to-r py-3 font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  {t("subscribe")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10 px-4 py-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-gray-400">{t("copyright")}</div>
            <div className="flex items-center gap-6 text-sm">
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
              <div className="flex items-center gap-2 text-gray-400">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                <span className="text-xs">{t("allSystemsOperational")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
