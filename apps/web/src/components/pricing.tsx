import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { CheckCircle, Shield, Sparkles, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Pricing() {
  const t = useTranslations("Pricing");
  return (
    <section id="pricing" className="bg-muted/30 px-3 py-16 sm:px-4 sm:py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-20">
          <Badge className="from-accent/10 to-primary/10 text-accent border-accent/30 hover:from-accent/20 hover:to-primary/20 mb-4 rounded-full border bg-gradient-to-r px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r sm:mb-6 sm:px-6 sm:py-3 sm:text-sm">
            <Zap className="mr-2 h-3 w-3 animate-pulse sm:h-4 sm:w-4" />
            {t("badge")}
          </Badge>
          <h2 className="from-primary via-accent to-primary mb-4 bg-gradient-to-r bg-clip-text font-serif text-3xl font-bold text-transparent transition-transform duration-300 hover:scale-105 sm:mb-6 sm:text-5xl md:text-7xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl px-2 text-base leading-relaxed sm:px-0 sm:text-xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid items-stretch gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
          {/* Free Plan */}
          <div className="group relative">
            <div className="from-primary/20 to-accent/20 absolute -inset-1 rounded-2xl bg-gradient-to-r opacity-0 blur transition duration-500 group-hover:opacity-100 sm:rounded-3xl"></div>
            <Card className="bg-card/90 group-hover:bg-card/95 relative flex h-full flex-col border-0 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <CardHeader className="relative px-4 pb-4 text-center sm:px-6 sm:pb-6">
                <div className="bg-muted/50 text-muted-foreground absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold opacity-0 transition-all duration-300 group-hover:opacity-100 sm:top-4 sm:right-4 sm:h-8 sm:w-8 sm:text-sm">
                  1
                </div>
                <CardTitle className="group-hover:text-primary mb-2 font-serif text-2xl font-bold transition-colors duration-300 sm:text-3xl">
                  {t("free.title")}
                </CardTitle>
                <CardDescription className="group-hover:text-foreground/80 mb-4 text-sm transition-colors duration-300 sm:mb-6 sm:text-base">
                  {t("free.subtitle")}
                </CardDescription>
                <div className="mb-4 text-4xl font-bold transition-transform duration-300 group-hover:scale-110 sm:text-5xl">
                  {t("free.price")}
                  <span className="text-muted-foreground text-base font-normal sm:text-lg">
                    {t("free.period")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col px-4 sm:px-6">
                <ul className="mb-6 flex-1 space-y-3 sm:mb-8 sm:space-y-4">
                  <li className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                    <span className="group-hover:text-foreground text-sm transition-colors duration-300 sm:text-base">
                      {t("free.features.basicLogging")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1 sm:gap-3"
                    style={{ transitionDelay: "50ms" }}
                  >
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                    <span className="group-hover:text-foreground text-sm transition-colors duration-300 sm:text-base">
                      {t("free.features.telegram")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1 sm:gap-3"
                    style={{ transitionDelay: "100ms" }}
                  >
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                    <span className="group-hover:text-foreground text-sm transition-colors duration-300 sm:text-base">
                      {t("free.features.basicReports")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Premium Plan - Most Popular */}
          <div className="group relative transform md:-mt-4 md:scale-110">
            <div className="from-primary via-accent to-primary absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-r opacity-75 blur-lg transition duration-500 group-hover:opacity-100 sm:-inset-2 sm:rounded-3xl"></div>
            <Card className="border-primary hover:shadow-3xl bg-card relative flex h-full flex-col border-2 shadow-2xl transition-all duration-500 hover:scale-105">
              <Badge className="from-primary via-accent to-primary text-primary-foreground hover:shadow-primary/50 border-primary-foreground/20 absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform rounded-full border-2 bg-gradient-to-r px-6 py-2 text-xs shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-2xl sm:-top-6 sm:px-8 sm:py-3 sm:text-sm">
                <Sparkles
                  className="mr-2 h-4 w-4 animate-spin sm:h-5 sm:w-5"
                  style={{ animationDuration: "3s" }}
                />
                {t("premium.badge")}
                <div className="from-primary/50 to-accent/50 absolute inset-0 -z-10 animate-pulse rounded-full bg-gradient-to-r blur-md"></div>
              </Badge>
              <CardHeader className="relative px-4 pt-6 pb-4 text-center sm:px-6 sm:pt-8 sm:pb-6">
                <div className="bg-primary/20 text-primary absolute top-4 right-3 flex h-8 w-8 animate-bounce items-center justify-center rounded-full text-base font-bold opacity-0 transition-all duration-300 group-hover:opacity-100 sm:top-6 sm:right-4 sm:h-10 sm:w-10 sm:text-lg">
                  ⭐
                </div>
                <CardTitle className="group-hover:text-primary mb-2 font-serif text-2xl font-bold transition-colors duration-300 sm:text-3xl">
                  {t("premium.title")}
                </CardTitle>
                <CardDescription className="group-hover:text-foreground/80 mb-4 text-sm transition-colors duration-300 sm:mb-6 sm:text-base">
                  {t("premium.subtitle")}
                </CardDescription>
                <div className="text-foreground mb-4 text-4xl font-bold transition-transform duration-300 group-hover:scale-110 sm:text-5xl">
                  {t("premium.price")}
                  <span className="text-muted-foreground text-base font-normal sm:text-lg">
                    {t("premium.period")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col px-4 sm:px-6">
                <ul className="mb-6 flex-1 space-y-3 sm:mb-8 sm:space-y-4">
                  <li className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                    <span className="group-hover:text-foreground text-sm transition-colors duration-300 sm:text-base">
                      {t("premium.features.everythingFree")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1 sm:gap-3"
                    style={{ transitionDelay: "50ms" }}
                  >
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                    <span className="group-hover:text-foreground text-sm transition-colors duration-300 sm:text-base">
                      {t("premium.features.advancedAnalytics")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1 sm:gap-3"
                    style={{ transitionDelay: "100ms" }}
                  >
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:scale-300 sm:h-5 sm:w-5" />
                    <span className="group-hover:text-foreground text-sm transition-colors duration-300 sm:text-base">
                      {t("premium.features.smartReminders")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1 sm:gap-3"
                    style={{ transitionDelay: "150ms" }}
                  >
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                    <span className="group-hover:text-foreground text-sm transition-colors duration-300 sm:text-base">
                      {t("premium.features.receiptAnalysis")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Family Plan */}
          <div className="group relative">
            <div className="from-accent/20 to-primary/20 absolute -inset-1 rounded-2xl bg-gradient-to-r opacity-0 blur transition duration-500 group-hover:opacity-100 sm:rounded-3xl"></div>
            <Card className="bg-card/90 group-hover:bg-card/95 relative flex h-full flex-col border-0 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <CardHeader className="relative px-4 pb-4 text-center sm:px-6 sm:pb-6">
                <div className="bg-accent/20 text-accent absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold opacity-0 transition-all duration-300 group-hover:opacity-100 sm:top-4 sm:right-4 sm:h-8 sm:w-8 sm:text-sm">
                  👨‍👩‍👧‍👦
                </div>
                <CardTitle className="group-hover:text-accent mb-2 font-serif text-2xl font-bold transition-colors duration-300 sm:text-3xl">
                  {t("family.title")}
                </CardTitle>
                <CardDescription className="group-hover:text-foreground/80 mb-4 text-sm transition-colors duration-300 sm:mb-6 sm:text-base">
                  {t("family.subtitle")}
                </CardDescription>
                <div className="mb-4 text-4xl font-bold transition-transform duration-300 group-hover:scale-110 sm:text-5xl">
                  {t("family.price")}
                  <span className="text-muted-foreground text-base font-normal sm:text-lg">
                    {t("family.period")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col px-4 sm:px-6">
                <ul className="mb-6 flex-1 space-y-3 sm:mb-8 sm:space-y-4">
                  <li className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                    <span className="group-hover:text-foreground text-sm transition-colors duration-300 sm:text-base">
                      {t("family.features.everythingPremium")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1 sm:gap-3"
                    style={{ transitionDelay: "50ms" }}
                  >
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                    <span className="group-hover:text-foreground text-sm transition-colors duration-300 sm:text-base">
                      {t("family.features.multiUser")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1 sm:gap-3"
                    style={{ transitionDelay: "100ms" }}
                  >
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                    <span className="group-hover:text-foreground text-sm transition-colors duration-300 sm:text-base">
                      {t("family.features.sharedAnalytics")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1 sm:gap-3"
                    style={{ transitionDelay: "150ms" }}
                  >
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                    <span className="group-hover:text-foreground text-sm transition-colors duration-300 sm:text-base">
                      {t("family.features.familyInsights")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center sm:mt-16">
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-6 px-2 text-xs sm:gap-8 sm:px-0 sm:text-sm">
            <div className="hover:text-foreground flex items-center gap-2 transition-colors duration-300">
              <Shield className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t("trust.moneyBack")}</span>
            </div>
            <div className="hover:text-foreground flex items-center gap-2 transition-colors duration-300">
              <CheckCircle className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t("trust.cancelAnytime")}</span>
            </div>
            <div className="hover:text-foreground flex items-center gap-2 transition-colors duration-300">
              <Zap className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t("trust.instantActivation")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
