import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Award,
  BarChart3,
  Clock,
  Cloud,
  MessageSquare,
  PiggyBank,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function Features() {
  const t = useTranslations("Features");
  return (
    <section
      id="features"
      className="from-background to-muted/20 bg-gradient-to-br px-4 py-16 sm:py-24 lg:py-32"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
          <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 mb-4 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:scale-105 sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
            <Sparkles className="mr-1.5 h-3 w-3 animate-pulse sm:mr-2 sm:h-4 sm:w-4" />
            {t("badge")}
          </Badge>
          <h2 className="mb-4 font-serif text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl xl:text-6xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl px-4 text-base sm:px-0 sm:text-lg lg:text-xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid items-stretch gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20 sm:mb-4 sm:h-12 sm:w-12">
                <MessageSquare className="h-5 w-5 text-blue-600 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6" />
              </div>
              <CardTitle className="mb-2 text-lg font-bold transition-colors duration-300 group-hover:text-blue-600 sm:text-xl">
                {t("smartLogging.title")}
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 text-sm transition-colors duration-300 sm:text-base">
                {t("smartLogging.description")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/20 sm:mb-4 sm:h-12 sm:w-12">
                <Target className="h-5 w-5 text-purple-600 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6" />
              </div>
              <CardTitle className="mb-2 text-lg font-bold transition-colors duration-300 group-hover:text-purple-600 sm:text-xl">
                {t("aiInsights.title")}
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 text-sm transition-colors duration-300 sm:text-base">
                {t("aiInsights.description")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-500/20 sm:mb-4 sm:h-12 sm:w-12">
                <BarChart3 className="h-5 w-5 text-teal-600 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6" />
              </div>
              <CardTitle className="mb-2 text-lg font-bold transition-colors duration-300 group-hover:text-teal-600 sm:text-xl">
                {t("analytics.title")}
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 text-sm transition-colors duration-300 sm:text-base">
                {t("analytics.description")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500/20 sm:mb-4 sm:h-12 sm:w-12">
                <Clock className="h-5 w-5 text-orange-600 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6" />
              </div>
              <CardTitle className="mb-2 text-lg font-bold transition-colors duration-300 group-hover:text-orange-600 sm:text-xl">
                {t("reminders.title")}
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 text-sm transition-colors duration-300 sm:text-base">
                {t("reminders.description")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-500/20 sm:mb-4 sm:h-12 sm:w-12">
                <Award className="h-5 w-5 text-green-600 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6" />
              </div>
              <CardTitle className="mb-2 text-lg font-bold transition-colors duration-300 group-hover:text-green-600 sm:text-xl">
                {t("productivity.title")}
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 text-sm transition-colors duration-300 sm:text-base">
                {t("productivity.description")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-500/20 sm:mb-4 sm:h-12 sm:w-12">
                <Shield className="h-5 w-5 text-indigo-600 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6" />
              </div>
              <CardTitle className="mb-2 text-lg font-bold transition-colors duration-300 group-hover:text-indigo-600 sm:text-xl">
                {t("security.title")}
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 text-sm transition-colors duration-300 sm:text-base">
                {t("security.description")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-500/20 sm:mb-4 sm:h-12 sm:w-12">
                <Cloud className="h-5 w-5 text-cyan-600 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6" />
              </div>
              <CardTitle className="mb-2 text-lg font-bold transition-colors duration-300 group-hover:text-cyan-600 sm:text-xl">
                {t("weatherIntegration.title")}
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 text-sm transition-colors duration-300 sm:text-base">
                {t("weatherIntegration.description")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/20 sm:mb-4 sm:h-12 sm:w-12">
                <PiggyBank className="h-5 w-5 text-amber-600 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6" />
              </div>
              <CardTitle className="mb-2 text-lg font-bold transition-colors duration-300 group-hover:text-amber-600 sm:text-xl">
                {t("smartPlanning.title")}
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 text-sm transition-colors duration-300 sm:text-base">
                {t("smartPlanning.description")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
