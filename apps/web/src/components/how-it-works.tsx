"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Badge } from "@/src/components/ui/badge";
import { BarChart3, MessageSquare, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HowItWorks() {
  const t = useTranslations("HowItWorks");
  const steps = [
    {
      title: t("step1.title"),
      description: t("step1.description"),
      points: (t.raw("step1.points") as unknown as string[]) ?? [],
      Icon: MessageSquare,
      image: "/how-step1-chat.svg",
    },
    {
      title: t("step2.title"),
      description: t("step2.description"),
      points: (t.raw("step2.points") as unknown as string[]) ?? [],
      Icon: Zap,
      image: "/how-step2-automation.svg",
    },
    {
      title: t("step3.title"),
      description: t("step3.description"),
      points: (t.raw("step3.points") as unknown as string[]) ?? [],
      Icon: BarChart3,
      image: "/how-step3-analytics.svg",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const [isPaused, setIsPaused] = useState(false);
  const DURATION_MS = 5000;

  // refs for precise pause/resume timing
  const startedAtRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Respect prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setPrefersReducedMotion(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Автоцикличный прогресс и переключение шага (с паузой при наведении)
  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(0);
      return;
    }
    setProgress(0);
    startedAtRef.current = Date.now();
    lastTickRef.current = Date.now();
    const tick = () => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      if (isPausedRef.current) {
        // смещаем начало так, чтобы elapsed оставался замороженным
        startedAtRef.current += delta;
        return;
      }
      const elapsed = now - startedAtRef.current;
      const p = Math.min(1, elapsed / DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        setActiveIndex((i) => (i + 1) % steps.length);
      }
    };
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, steps.length, prefersReducedMotion]);
  return (
    <section id="how-it-works" className="section">
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

        <div
          className="grid items-center gap-8 lg:grid-cols-2 lg:min-h-[480px]"
          tabIndex={0}
          aria-label={t("title")}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              setActiveIndex((i) => (i + 1) % steps.length);
            } else if (e.key === "ArrowLeft") {
              setActiveIndex((i) => (i - 1 + steps.length) % steps.length);
            }
          }}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {/* Left: vertical steps list */}
          <ol className="hidden lg:flex flex-col gap-5 list-none" role="list" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            {steps.map((s, i) => {
              const Icon = s.Icon;
              const isActive = i === activeIndex;
              return (
                <li key={s.title} className="relative overflow-hidden rounded-lg" aria-current={isActive ? "step" : undefined}>

                  {(
                    <button
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      data-state={isActive ? "open" : "closed"}
                      aria-pressed={isActive}
                      className="group w-full cursor-pointer rounded-lg p-3 sm:p-4 text-left outline-none hover:bg-muted/40"
                      title={s.title}
                    >
                      <div className="relative flex items-start gap-2">
                        {/* Progress bar spanning full text block height */}
                        <div className="absolute left-0 top-0 bottom-0 h-full w-1 overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-500/40 pointer-events-none z-20" aria-hidden>
                          <div
                            className="absolute left-0 top-0 h-full w-full origin-top bg-green-500 dark:bg-green-400 will-change-transform transition-transform ease-linear"
                            style={{ transform: `scaleY(${isActive ? progress : 0})`, transitionDuration: `${DURATION_MS}ms` }}
                          />
                        </div>
                        <div className="sm:ml-6 ml-2 sm:mr-3 mr-1 shrink-0">
                          <div className="item-box w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon className="text-primary w-6 h-6" />
                          </div>
                        </div>
                        <div className="ml-1 sm:ml-2">
                          <span className="block text-left text-lg font-semibold tracking-tight">
                            <span className="mr-2">{i + 1}.</span>
                            {s.title}
                          </span>
                          <p className="mt-1 text-base leading-relaxed text-muted-foreground">{s.description}</p>
                        </div>
                      </div>
                    </button>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Right: media preview */}
          <div className="col-span-1">
            <div
              className="relative h-[260px] w-full overflow-hidden rounded-[28px] border border-border/60 bg-background shadow-xl sm:h-[300px] md:h-[340px] lg:h-[420px]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              onTouchCancel={() => setIsPaused(false)}
            >
              {/* Top device bar */}
              <div className="absolute left-0 right-0 top-0 z-10 flex h-10 items-center justify-between px-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                </div>
              </div>
              {/* Crossfade images */}
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className={`absolute inset-0 transition-opacity duration-300 ${i === activeIndex ? "opacity-100" : "opacity-0"}`}
                  aria-hidden={i !== activeIndex}
                >
                  <Image src={s.image} alt={s.title} fill className="object-cover p-3 rounded-[28px]" priority={i === 0} />
                </div>
              ))}
              {/* Decorative overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-25">
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary/20 to-secondary/20" />
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
            {/* Thumbnails navigation removed */}
          </div>
        </div>

        {/* Mobile: horizontal cards with snap */}
        <div className="lg:hidden">
          <ul
            className="flex snap-x snap-mandatory flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_10%,white_90%,transparent)] [mask-image:linear-gradient(90deg,transparent,black_10%,white_90%,transparent)]"
            style={{ padding: "40px 10%" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            onTouchCancel={() => setIsPaused(false)}
          >
            {steps.map((s, i) => {
              const isActive = i === activeIndex;
              return (
                <li key={s.title} className="relative grid h-full max-w-64 shrink-0 snap-center items-start justify-center p-3 first:rounded-tl-xl last:rounded-tr-xl">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className="grid items-start justify-center p-0 text-left bg-transparent"
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold">
                        <span className="mr-2">{i + 1}.</span>
                        {s.title}
                      </h3>
                      <p className="mx-0 max-w-sm text-balance text-sm font-medium leading-relaxed text-muted-foreground">
                        {s.description}
                      </p>
                      {Array.isArray((s as any).points) && (s as any).points.length > 0 && (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                          {(s as any).points.map((p: string, idx: number) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      )}
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
