"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, MessageSquare, Sparkles, Target, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@synoro/ui";

export default function Features() {
  const t = useTranslations("Features");
  // Reveal-on-scroll animation with reduced-motion support
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setPrefersReducedMotion(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setInView(true);
      return;
    }
    const node = containerRef.current;
    if (!node) return;

    // Сначала устанавливаем false, чтобы элементы были скрыты
    setInView(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { root: null, threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const getItemStyle = (idx: number) => {
    if (prefersReducedMotion) return {} as const;
    const delay = idx * 50; // быстрый stagger: 0/50/100ms
    return {
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0px)" : "translateY(20px)",
      transitionProperty: "opacity, transform",
      transitionDuration: "200ms", // быстрее
      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // easeOutExpo
      transitionDelay: inView ? `${delay}ms` : "0ms",
    } as const;
  };
  return (
    <section id="features" className="section section-gradient">
      <div ref={containerRef} className="container-default">
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
          <div
            className="group flex items-start gap-4 text-left transition-transform duration-150 will-change-transform hover:-translate-y-1"
            style={getItemStyle(0)}
          >
            <div className="mt-1">
              <Brain className="text-primary h-6 w-6 transition-transform duration-150 group-hover:scale-110" />
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight">
                {t("aiIntelligence.title")}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                {t("aiIntelligence.description")}
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                <li>{t("aiIntelligence.features.smartLogging")}</li>
                <li>{t("aiIntelligence.features.automaticClassification")}</li>
                <li>{t("aiIntelligence.features.voiceRecognition")}</li>
              </ul>
            </div>
          </div>

          {/* Smart Planning & Analytics */}
          <div
            className="group flex items-start gap-4 text-left transition-transform duration-150 will-change-transform hover:-translate-y-1"
            style={getItemStyle(1)}
          >
            <div className="mt-1">
              <Target className="text-primary h-6 w-6 transition-transform duration-150 group-hover:scale-110" />
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight">
                {t("smartPlanning.title")}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                {t("smartPlanning.description")}
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                <li>{t("smartPlanning.features.weatherIntegration")}</li>
                <li>{t("smartPlanning.features.smartReminders")}</li>
                <li>{t("smartPlanning.features.savingsStrategy")}</li>
              </ul>
            </div>
          </div>

          {/* Productivity & Security */}
          <div
            className="group flex items-start gap-4 text-left transition-transform duration-150 will-change-transform hover:-translate-y-1"
            style={getItemStyle(2)}
          >
            <div className="mt-1">
              <Zap className="text-primary h-6 w-6 transition-transform duration-150 group-hover:scale-110" />
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight">
                {t("productivity.title")}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                {t("productivity.description")}
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                <li>{t("productivity.features.gamification")}</li>
                <li>{t("productivity.features.advancedAnalytics")}</li>
                <li>{t("productivity.features.enterpriseSecurity")}</li>
              </ul>
            </div>
          </div>
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
