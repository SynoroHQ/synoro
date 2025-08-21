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
  Shield,
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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* AI-Powered Intelligence */}
          <Card className="group card-magic">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 p-6 sm:p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-500/30 group-hover:to-purple-500/30">
                <Brain className="h-8 w-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="mb-4 text-2xl font-bold transition-colors duration-300 group-hover:text-blue-600">
                {t("aiIntelligence.title")}
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 mb-6 text-base leading-relaxed transition-colors duration-300">
                {t("aiIntelligence.description")}
              </CardDescription>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">
                    {t("aiIntelligence.features.smartLogging")}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">
                    {t("aiIntelligence.features.automaticClassification")}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">
                    {t("aiIntelligence.features.voiceRecognition")}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Smart Planning & Analytics */}
          <Card className="group card-magic">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-green-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 p-6 sm:p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500/20 to-green-500/20 transition-all duration-300 group-hover:scale-110 group-hover:from-teal-500/30 group-hover:to-green-500/30">
                <Target className="h-8 w-8 text-teal-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="mb-4 text-2xl font-bold transition-colors duration-300 group-hover:text-teal-600">
                {t("smartPlanning.title")}
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 mb-6 text-base leading-relaxed transition-colors duration-300">
                {t("smartPlanning.description")}
              </CardDescription>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-2 w-2 rounded-full bg-teal-500"></div>
                  <span className="text-sm font-medium">
                    {t("smartPlanning.features.weatherIntegration")}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex h-2 w-2 rounded-full bg-teal-500"></div>
                  <span className="text-sm font-medium">
                    {t("smartPlanning.features.smartReminders")}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex h-2 w-2 rounded-full bg-teal-500"></div>
                  <span className="text-sm font-medium">
                    {t("smartPlanning.features.savingsStrategy")}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Productivity & Security */}
          <Card className="group card-magic">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 p-6 sm:p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 transition-all duration-300 group-hover:scale-110 group-hover:from-orange-500/30 group-hover:to-amber-500/30">
                <Zap className="h-8 w-8 text-orange-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="mb-4 text-2xl font-bold transition-colors duration-300 group-hover:text-orange-600">
                {t("productivity.title")}
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 mb-6 text-base leading-relaxed transition-colors duration-300">
                {t("productivity.description")}
              </CardDescription>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-2 w-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium">
                    {t("productivity.features.gamification")}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex h-2 w-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium">
                    {t("productivity.features.advancedAnalytics")}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex h-2 w-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium">
                    {t("productivity.features.enterpriseSecurity")}
                  </span>
                </div>
              </div>
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
