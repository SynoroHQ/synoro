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
    <section id="pricing" className="bg-muted/30 px-4 py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <Badge className="from-accent/10 to-primary/10 text-accent border-accent/30 hover:from-accent/20 hover:to-primary/20 mb-6 rounded-full border bg-gradient-to-r px-6 py-3 text-sm font-medium shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r">
            <Zap className="mr-2 h-4 w-4 animate-pulse" />
            {t("badge")}
          </Badge>
          <h2 className="from-primary via-accent to-primary mb-6 bg-gradient-to-r bg-clip-text font-serif text-5xl font-bold text-transparent transition-transform duration-300 hover:scale-105 md:text-7xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid items-stretch gap-8 md:grid-cols-3">
          {/* Free Plan */}
          <div className="group relative">
            <div className="from-primary/20 to-accent/20 absolute -inset-1 rounded-3xl bg-gradient-to-r opacity-0 blur transition duration-500 group-hover:opacity-100"></div>
            <Card className="bg-card/90 group-hover:bg-card/95 relative flex h-full flex-col border-0 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <CardHeader className="relative pb-6 text-center">
                <div className="bg-muted/50 text-muted-foreground absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold opacity-0 transition-all duration-300 group-hover:opacity-100">
                  1
                </div>
                <CardTitle className="group-hover:text-primary mb-2 font-serif text-3xl font-bold transition-colors duration-300">
                  {t("free.title")}
                </CardTitle>
                <CardDescription className="group-hover:text-foreground/80 mb-6 text-base transition-colors duration-300">
                  {t("free.subtitle")}
                </CardDescription>
                <div className="mb-4 text-5xl font-bold transition-transform duration-300 group-hover:scale-110">
                  {t("free.price")}
                  <span className="text-muted-foreground text-lg font-normal">
                    {t("free.period")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col px-6">
                <ul className="mb-8 flex-1 space-y-4">
                  <li className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1">
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {t("free.features.basicLogging")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ transitionDelay: "50ms" }}
                  >
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {t("free.features.telegram")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ transitionDelay: "100ms" }}
                  >
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {t("free.features.basicReports")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Premium Plan - Most Popular */}
          <div className="group relative transform md:-mt-4 md:scale-110">
            <div className="from-primary via-accent to-primary absolute -inset-2 animate-pulse rounded-3xl bg-gradient-to-r opacity-75 blur-lg transition duration-500 group-hover:opacity-100"></div>
            <Card className="border-primary hover:shadow-3xl bg-card relative flex h-full flex-col border-2 shadow-2xl transition-all duration-500 hover:scale-105">
              <Badge className="from-primary via-accent to-primary text-primary-foreground hover:shadow-primary/50 border-primary-foreground/20 absolute -top-6 left-1/2 z-10 -translate-x-1/2 transform rounded-full border-2 bg-gradient-to-r px-8 py-3 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-2xl">
                <Sparkles
                  className="mr-2 h-5 w-5 animate-spin"
                  style={{ animationDuration: "3s" }}
                />
                Most Popular
                <div className="from-primary/50 to-accent/50 absolute inset-0 -z-10 animate-pulse rounded-full bg-gradient-to-r blur-md"></div>
              </Badge>
              <CardHeader className="relative pt-8 pb-6 text-center">
                <div className="bg-primary/20 text-primary absolute top-6 right-4 flex h-10 w-10 animate-bounce items-center justify-center rounded-full text-lg font-bold opacity-0 transition-all duration-300 group-hover:opacity-100">
                  ⭐
                </div>
                <CardTitle className="group-hover:text-primary mb-2 font-serif text-3xl font-bold transition-colors duration-300">
                  {t("premium.title")}
                </CardTitle>
                <CardDescription className="group-hover:text-foreground/80 mb-6 text-base transition-colors duration-300">
                  {t("premium.subtitle")}
                </CardDescription>
                <div className="text-foreground mb-4 text-5xl font-bold transition-transform duration-300 group-hover:scale-110">
                  {t("premium.price")}
                  <span className="text-muted-foreground text-lg font-normal">
                    {t("premium.period")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col px-6">
                <ul className="mb-8 flex-1 space-y-4">
                  <li className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1">
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {t("premium.features.everythingFree")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ transitionDelay: "50ms" }}
                  >
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {t("premium.features.advancedAnalytics")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ transitionDelay: "100ms" }}
                  >
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:scale-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {t("premium.features.smartReminders")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ transitionDelay: "150ms" }}
                  >
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {t("premium.features.receiptAnalysis")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Family Plan */}
          <div className="group relative">
            <div className="from-accent/20 to-primary/20 absolute -inset-1 rounded-3xl bg-gradient-to-r opacity-0 blur transition duration-500 group-hover:opacity-100"></div>
            <Card className="bg-card/90 group-hover:bg-card/95 relative flex h-full flex-col border-0 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <CardHeader className="relative pb-6 text-center">
                <div className="bg-accent/20 text-accent absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold opacity-0 transition-all duration-300 group-hover:opacity-100">
                  👨‍👩‍👧‍👦
                </div>
                <CardTitle className="group-hover:text-accent mb-2 font-serif text-3xl font-bold transition-colors duration-300">
                  {t("family.title")}
                </CardTitle>
                <CardDescription className="group-hover:text-foreground/80 mb-6 text-base transition-colors duration-300">
                  {t("family.subtitle")}
                </CardDescription>
                <div className="mb-4 text-5xl font-bold transition-transform duration-300 group-hover:scale-110">
                  {t("family.price")}
                  <span className="text-muted-foreground text-lg font-normal">
                    {t("family.period")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col px-6">
                <ul className="mb-8 flex-1 space-y-4">
                  <li className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1">
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {t("family.features.everythingPremium")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ transitionDelay: "50ms" }}
                  >
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {t("family.features.multiUser")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ transitionDelay: "100ms" }}
                  >
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-300 group-hover:scale-110" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {t("family.features.sharedAnalytics")}
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ transitionDelay: "150ms" }}
                  >
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {t("family.features.familyInsights")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-8 text-sm sm:flex-row">
            <div className="hover:text-foreground flex items-center gap-2 transition-colors duration-300">
              <Shield className="text-primary h-4 w-4" />
              <span>{t("trust.moneyBack")}</span>
            </div>
            <div className="hover:text-foreground flex items-center gap-2 transition-colors duration-300">
              <CheckCircle className="text-primary h-4 w-4" />
              <span>{t("trust.cancelAnytime")}</span>
            </div>
            <div className="hover:text-foreground flex items-center gap-2 transition-colors duration-300">
              <Zap className="text-primary h-4 w-4" />
              <span>{t("trust.instantActivation")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
