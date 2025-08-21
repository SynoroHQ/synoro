"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  const steps = [
    {
      title: t("step1.title"),
      description: t("step1.description"),
      Icon: MessageSquare,
      image: "/abstract-tech-pattern.png",
    },
    {
      title: t("step2.title"),
      description: t("step2.description"),
      Icon: Zap,
      image: "/modern-geometric-pattern.png",
    },
    {
      title: t("step3.title"),
      description: t("step3.description"),
      Icon: BarChart3,
      image: "/abstract-tech-pattern.png",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const DURATION_MS = 5000;

  // Автоцикличный прогресс и переключение шага
  useEffect(() => {
    setProgress(0);
    const startedAt = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const p = Math.min(1, elapsed / DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        setActiveIndex((i) => (i + 1) % steps.length);
      }
    };
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, steps.length]);
  return (
    <section id="how-it-works" className="section section-muted">
      <div className="container-default">
        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
          <Badge className="bg-accent/10 text-accent border-accent/20 mb-4 rounded-full px-3 py-1.5 text-xs font-medium sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
            <Zap className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            {t("badge")}
          </Badge>
          <h2 className="heading-title mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="heading-subtitle text-muted-foreground mx-auto max-w-2xl px-2 text-base sm:px-0 sm:text-lg lg:text-xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-2 lg:min-h-[450px]">
          {/* Left: vertical steps list */}
          <div className="hidden lg:flex flex-col gap-6">
            {steps.map((s, i) => {
              const Icon = s.Icon;
              const isActive = i === activeIndex;
              return (
                <div key={s.title} className="relative overflow-hidden rounded-lg">
                  {/* Progress underline */}
                  <div className={`absolute left-0 right-0 bottom-0 h-0.5 w-full transition-opacity ${isActive ? "opacity-100" : "opacity-0"} bg-neutral-300/50 dark:bg-neutral-300/30`}
                       aria-hidden>
                    <div
                      className="absolute left-0 top-0 h-full bg-secondary transition-[width] ease-linear"
                      style={{ width: isActive ? `${progress * 100}%` : "0%" }}
                    />
                  </div>

                  {isActive ? (
                    <Card
                      className="relative cursor-pointer"
                      onClick={() => setActiveIndex(i)}
                      data-state="open"
                    >
                      <CardHeader className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                            <CardTitle className="text-lg font-semibold tracking-tight">{s.title}</CardTitle>
                          </div>
                        </div>
                        {/* Accordion content */}
                        <div
                          className="overflow-hidden text-sm font-medium transition-[max-height] duration-300"
                          style={{ maxHeight: isActive ? 64 : 0 }}
                        >
                          <div className="pt-2 text-muted-foreground">{s.description}</div>
                        </div>
                      </CardHeader>
                    </Card>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      data-state="closed"
                      className="group flex h-[45px] w-full cursor-pointer items-center justify-between rounded-lg p-3 text-left outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="text-primary h-5 w-5" />
                        <span className="text-left text-lg font-semibold tracking-tight">{s.title}</span>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: media preview */}
          <div className="col-span-1">
            <div className="relative h-[240px] w-full overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-b from-muted/40 to-background shadow-xl sm:h-[280px] md:h-[320px] lg:h-[400px]">
              {/* Crossfade images */}
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className={`absolute inset-0 transition-opacity duration-300 ${i === activeIndex ? "opacity-100" : "opacity-0"}`}
                  aria-hidden={i !== activeIndex}
                >
                  <Image src={s.image} alt={s.title} fill className="object-cover p-1 rounded-2xl" priority={i === 0} />
                </div>
              ))}
              {/* Decorative overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-30">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20" />
              </div>
              {/* Progress bar for auto-switch */}
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
                className="absolute left-0 right-0 bottom-0 h-1.5 bg-foreground/10"
              >
                <div
                  className="h-full bg-secondary transition-[width] ease-linear"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: horizontal cards with snap */}
        <div className="lg:hidden">
          <ul className="flex snap-x snap-mandatory flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_10%,white_90%,transparent)] [mask-image:linear-gradient(90deg,transparent,black_10%,white_90%,transparent)]" style={{ padding: "40px 10%" }}>
            {steps.map((s, i) => {
              const isActive = i === activeIndex;
              return (
                <li key={s.title} className="relative grid h-full max-w-64 shrink-0 snap-center items-start justify-center p-3 first:rounded-tl-xl last:rounded-tr-xl">
                  {/* Progress underline */}
                  <div className={`absolute left-0 right-0 bottom-0 h-0.5 w-full transition-opacity ${isActive ? "opacity-100" : "opacity-0"} bg-neutral-300/50 dark:bg-neutral-300/30`} aria-hidden>
                    <div className="absolute left-0 top-0 h-full bg-secondary transition-[width] ease-linear" style={{ width: isActive ? `${progress * 100}%` : "0%" }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className="card grid items-start justify-center rounded-xl border border-border bg-background p-3 text-left"
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold">{s.title}</h3>
                      <p className="mx-0 max-w-sm text-balance text-sm font-medium leading-relaxed text-muted-foreground">
                        {s.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
