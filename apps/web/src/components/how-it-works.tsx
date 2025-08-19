import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { BarChart3, MessageSquare, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HowItWorks() {
  const t = useTranslations("HowItWorks");
  return (
    <section id="features" className="bg-muted/30 px-4 py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
          <Badge className="bg-accent/10 text-accent border-accent/20 mb-4 rounded-full px-3 py-1.5 text-xs font-medium sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
            <Zap className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            {t("badge")}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl px-2 text-base sm:px-0 sm:text-lg lg:text-xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid items-stretch gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          <div className="relative h-full">
            <Card className="bg-card/90 relative h-full border-0 backdrop-blur-sm">
              <CardHeader className="p-4 pb-6 text-center sm:p-6 sm:pb-8">
                <div className="from-primary to-accent mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br sm:mb-6 sm:h-16 sm:w-16">
                  <MessageSquare className="text-primary-foreground h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <CardTitle className="mb-3 text-xl sm:mb-4 sm:text-2xl">
                  {t("step1.title")}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed sm:text-base">
                  {t("step1.description")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="relative h-full">
            <Card className="bg-card/90 relative h-full border-0 backdrop-blur-sm">
              <CardHeader className="p-4 pb-6 text-center sm:p-6 sm:pb-8">
                <div className="from-accent to-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br">
                  <Zap className="text-primary-foreground h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <CardTitle className="mb-3 text-xl sm:mb-4 sm:text-2xl">
                  {t("step2.title")}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed sm:text-base">
                  {t("step2.description")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="relative h-full">
            <Card className="bg-card/90 relative h-full border-0 backdrop-blur-sm">
              <CardHeader className="p-4 pb-6 text-center sm:p-6 sm:pb-8">
                <div className="from-primary to-accent mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br sm:mb-6 sm:h-16 sm:w-16">
                  <BarChart3 className="text-primary-foreground h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <CardTitle className="mb-3 text-xl sm:mb-4 sm:text-2xl">
                  {t("step3.title")}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed sm:text-base">
                  {t("step3.description")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
