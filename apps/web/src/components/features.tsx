import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Brain,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function Features() {
  const t = useTranslations("Features");
  return (
    <section id="features" className="section section-gradient">
      <div className="container-default">
        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
          <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 mb-4 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:scale-105 sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
            <Sparkles className="mr-1.5 h-3 w-3 animate-pulse sm:mr-2 sm:h-4 sm:w-4" />
            {t("badge")}
          </Badge>
          <h2 className="heading-title mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl xl:text-6xl">
            {t("title")}
          </h2>
          <p className="heading-subtitle text-muted-foreground mx-auto max-w-2xl px-4 text-base sm:px-0 sm:text-lg lg:text-xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* AI-Powered Intelligence */}
          <Card className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-200 hover:bg-card/80 hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 transition-colors duration-200 group-hover:bg-muted/60">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mb-3 text-xl font-semibold">
                {t("aiIntelligence.title")}
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-4 text-sm sm:text-base">
                {t("aiIntelligence.description")}
              </CardDescription>

              <ul className="space-y-2 list-none m-0 p-0">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">
                    {t("aiIntelligence.features.smartLogging")}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">
                    {t("aiIntelligence.features.automaticClassification")}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">
                    {t("aiIntelligence.features.voiceRecognition")}
                  </span>
                </li>
              </ul>
            </CardHeader>
          </Card>

          {/* Smart Planning & Analytics */}
          <Card className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-200 hover:bg-card/80 hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 transition-colors duration-200 group-hover:bg-muted/60">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mb-3 text-xl font-semibold">
                {t("smartPlanning.title")}
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-4 text-sm sm:text-base">
                {t("smartPlanning.description")}
              </CardDescription>

              <ul className="space-y-2 list-none m-0 p-0">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">
                    {t("smartPlanning.features.weatherIntegration")}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">
                    {t("smartPlanning.features.smartReminders")}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">
                    {t("smartPlanning.features.savingsStrategy")}
                  </span>
                </li>
              </ul>
            </CardHeader>
          </Card>

          {/* Productivity & Security */}
          <Card className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-200 hover:bg-card/80 hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 transition-colors duration-200 group-hover:bg-muted/60">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mb-3 text-xl font-semibold">
                {t("productivity.title")}
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-4 text-sm sm:text-base">
                {t("productivity.description")}
              </CardDescription>

              <ul className="space-y-2 list-none m-0 p-0">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">
                    {t("productivity.features.gamification")}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">
                    {t("productivity.features.advancedAnalytics")}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">
                    {t("productivity.features.enterpriseSecurity")}
                  </span>
                </li>
              </ul>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-primary/10 text-primary inline-flex items-center space-x-2 rounded-full px-6 py-3">
            <MessageSquare className="h-5 w-5" />
            <span className="font-medium">{t("cta.message")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
