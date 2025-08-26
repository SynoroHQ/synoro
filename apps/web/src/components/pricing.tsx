import { CheckCircle, Shield, Sparkles, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui";

export default function Pricing() {
  const t = useTranslations("Pricing");
  return (
    <section
      id="pricing"
      className="bg-muted/30 px-3 py-16 sm:px-4 sm:py-24 lg:py-32"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-20">
          <Badge className="from-accent/10 to-primary/10 text-accent border-accent/30 mb-4 rounded-full border bg-gradient-to-r px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-sm sm:mb-6 sm:px-6 sm:py-3 sm:text-sm">
            <Zap className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            {t("badge")}
          </Badge>
          <h2 className="from-primary via-accent to-primary mb-4 bg-gradient-to-r bg-clip-text font-serif text-3xl font-bold text-transparent sm:mb-6 sm:text-5xl md:text-7xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl px-2 text-base leading-relaxed sm:px-0 sm:text-xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid items-stretch gap-6 sm:gap-8 md:grid-cols-3">
          {/* Beta Plan */}
          <div className="group relative">
            <Card className="bg-card/90 relative flex h-full flex-col border-0 shadow-xl backdrop-blur-sm">
              <Badge className="from-primary via-accent to-primary text-primary-foreground border-primary-foreground/20 absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform rounded-full border-2 bg-gradient-to-r px-6 py-2 text-xs shadow-xl backdrop-blur-sm sm:-top-6 sm:px-8 sm:py-3 sm:text-sm">
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {t("beta.badge")}
              </Badge>
              <CardHeader className="relative px-4 pt-6 pb-4 text-center sm:px-6 sm:pt-8 sm:pb-6">
                <CardTitle className="mb-2 font-serif text-2xl font-bold sm:text-3xl">
                  {t("beta.title")}
                </CardTitle>
                <CardDescription className="mb-4 text-sm sm:mb-6 sm:text-base">
                  {t("beta.subtitle")}
                </CardDescription>
                <div className="mb-4 text-4xl font-bold sm:text-5xl">
                  {t("beta.price")}
                  <span className="text-muted-foreground text-base font-normal sm:text-lg">
                    {t("beta.period")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col px-4 sm:px-6">
                <ul className="mb-6 flex-1 space-y-3 sm:mb-8 sm:space-y-4">
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("beta.features.allFeatures")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("beta.features.telegram")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("beta.features.advancedAnalytics")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("beta.features.smartReminders")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("beta.features.receiptAnalysis")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Premium Plan - Most Popular */}
          <div className="group relative transform md:-mt-4 md:scale-105 lg:scale-110">
            <Card className="border-primary bg-card relative flex h-full flex-col border-2 shadow-2xl">
              <Badge className="from-primary via-accent to-primary text-primary-foreground border-primary-foreground/20 absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform rounded-full border-2 bg-gradient-to-r px-6 py-2 text-xs shadow-xl backdrop-blur-sm sm:-top-6 sm:px-8 sm:py-3 sm:text-sm">
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {t("premium.badge")}
              </Badge>
              <CardHeader className="relative px-4 pt-6 pb-4 text-center sm:px-6 sm:pt-8 sm:pb-6">
                <div className="bg-primary/20 text-primary absolute top-4 right-3 flex h-8 w-8 items-center justify-center rounded-full text-base font-bold sm:top-6 sm:right-4 sm:h-10 sm:w-10 sm:text-lg">
                  ⭐
                </div>
                <CardTitle className="mb-2 font-serif text-2xl font-bold sm:text-3xl">
                  {t("premium.title")}
                </CardTitle>
                <CardDescription className="mb-4 text-sm sm:mb-6 sm:text-base">
                  {t("premium.subtitle")}
                </CardDescription>
                <div className="text-foreground mb-4 text-4xl font-bold sm:text-5xl">
                  {t("premium.price")}
                  <span className="text-muted-foreground text-base font-normal sm:text-lg">
                    {t("premium.period")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col px-4 sm:px-6">
                <ul className="mb-6 flex-1 space-y-3 sm:mb-8 sm:space-y-4">
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("premium.features.everythingBeta")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("premium.features.advancedAnalytics")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("premium.features.smartReminders")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("premium.features.receiptAnalysis")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Family Plan */}
          <div className="group relative">
            <Card className="bg-card/90 relative flex h-full flex-col border-0 shadow-xl backdrop-blur-sm">
              <CardHeader className="relative px-4 pb-4 text-center sm:px-6 sm:pb-6">
                <div className="bg-accent/20 text-accent absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold sm:top-4 sm:right-4 sm:h-8 sm:w-8 sm:text-sm">
                  👨‍👩‍👧‍👦
                </div>
                <CardTitle className="mb-2 font-serif text-2xl font-bold sm:text-3xl">
                  {t("family.title")}
                </CardTitle>
                <CardDescription className="mb-4 text-sm sm:mb-6 sm:text-base">
                  {t("family.subtitle")}
                </CardDescription>
                <div className="mb-4 text-4xl font-bold sm:text-5xl">
                  {t("family.price")}
                  <span className="text-muted-foreground text-base font-normal sm:text-lg">
                    {t("family.period")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col px-4 sm:px-6">
                <ul className="mb-6 flex-1 space-y-3 sm:mb-8 sm:space-y-4">
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("family.features.everythingPremium")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("family.features.multiUser")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {t("family.features.sharedAnalytics")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
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
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-6 px-2 text-xs sm:flex-row sm:gap-8 sm:px-0 sm:text-sm">
            <div className="flex items-center gap-2">
              <Shield className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t("trust.moneyBack")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t("trust.cancelAnytime")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t("trust.instantActivation")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
