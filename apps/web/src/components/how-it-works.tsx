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
    <section id="features" className="bg-muted/30 px-4 py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <Badge className="bg-accent/10 text-accent border-accent/20 mb-6 rounded-full px-4 py-2 text-sm font-medium">
            <Zap className="mr-2 h-4 w-4" />
            {t("badge")}
          </Badge>
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">{t("title")}</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid items-stretch gap-8 md:grid-cols-3">
          <div className="relative h-full">
            <Card className="bg-card/90 relative h-full border-0 backdrop-blur-sm">
              <CardHeader className="pb-8 text-center">
                <div className="from-primary to-accent mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br">
                  <MessageSquare className="text-primary-foreground h-8 w-8" />
                </div>
                <CardTitle className="mb-4 text-2xl">
                  {t("step1.title")}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {t("step1.description")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="relative h-full">
            <Card className="bg-card/90 relative h-full border-0 backdrop-blur-sm">
              <CardHeader className="pb-8 text-center">
                <div className="from-accent to-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br">
                  <Zap className="text-primary-foreground h-8 w-8" />
                </div>
                <CardTitle className="mb-4 text-2xl">
                  {t("step2.title")}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {t("step2.description")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="relative h-full">
            <Card className="bg-card/90 relative h-full border-0 backdrop-blur-sm">
              <CardHeader className="pb-8 text-center">
                <div className="from-primary to-accent mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br">
                  <BarChart3 className="text-primary-foreground h-8 w-8" />
                </div>
                <CardTitle className="mb-4 text-2xl">
                  {t("step3.title")}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
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
