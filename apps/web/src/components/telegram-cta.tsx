"use client";

import {
  ArrowRight,
  Bot,
  CheckCircle,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge, Button } from "@synoro/ui";

interface TelegramCTAProps {
  id?: string;
}

export default function TelegramCTA({ id = "cta-section" }: TelegramCTAProps) {
  const t = useTranslations("TelegramCTA");

  return (
    <section id={id} className="section relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="animate-rotate-slow absolute top-1/4 right-1/6 h-20 w-20 rotate-45 rounded-full border border-blue-500/20"></div>
        <div
          className="animate-rotate-slow absolute bottom-1/4 left-1/5 h-16 w-16 rotate-12 rounded-full border border-purple-500/20"
          style={{ animationDirection: "reverse" }}
        ></div>
      </div>

      <div className="container-default relative z-10">
        <div className="mb-12 text-center">
          <Badge className="mb-4 rounded-full border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-600">
            <Bot className="mr-2 h-4 w-4" />
            {t("badge")}
          </Badge>

          <h2 className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
            {t("title")}
          </h2>

          <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed md:text-xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-2">
          {/* Left side - Features */}
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { icon: MessageCircle, text: t("feature1") },
                { icon: Sparkles, text: t("feature2") },
                { icon: CheckCircle, text: t("feature3") },
              ].map((feature, index) => (
                <div key={index} className="group flex items-start gap-4">
                  <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 transition-colors group-hover:bg-blue-500/20">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground text-base leading-relaxed">
                      {feature.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                className="group rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                onClick={() =>
                  window.open(
                    "https://t.me/synoro_bot",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <MessageCircle className="mr-3 h-5 w-5" />
                {t("startBot")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Right side - Telegram preview */}
          <div className="relative">
            <div className="glass-effect bg-background/95 rounded-3xl border border-blue-500/30 p-6 shadow-2xl backdrop-blur-xl">
              {/* Telegram Header */}
              <div className="mb-6 flex items-center gap-3 border-b border-blue-500/20 pb-4">
                <div className="rounded-full bg-blue-500 p-3">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground font-semibold">@synoro_bot</h3>
                  <p className="text-muted-foreground text-sm">
                    {t("aiStatus")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                  <span className="text-xs text-green-600">{t("online")}</span>
                </div>
              </div>

              {/* Chat Preview */}
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-md border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                    <p className="text-sm text-blue-700">
                      {t("telegramCta.greeting")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-blue-500 px-4 py-3 text-white">
                    <p className="text-sm">{t("telegramCta.userExample")}</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-md border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                    <p className="text-sm text-blue-700">
                      {t("telegramCta.confirmation")}
                    </p>
                  </div>
                </div>

                {/* Input Preview */}
                <div className="border-t border-blue-500/20 pt-4">
                  <div className="text-muted-foreground flex items-center gap-3">
                    <div className="rounded-full bg-blue-500/10 p-2">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm italic">
                      {t("telegramCta.inputPlaceholder")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 animate-bounce rounded-full bg-green-500 p-3 text-white shadow-lg">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div
              className="absolute -bottom-4 -left-4 animate-bounce rounded-full bg-purple-500 p-3 text-white shadow-lg"
              style={{ animationDelay: "0.5s" }}
            >
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
