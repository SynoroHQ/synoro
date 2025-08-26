"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { CheckCircle, MessageSquare, Mic, Play, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("Hero");
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const animationSequence = [
      { step: 0, delay: 0 }, // Reset
      { step: 1, delay: 1000 }, // Show voice recording
      { step: 2, delay: 3000 }, // Show user message
      { step: 3, delay: 4000 }, // Show typing indicator
      { step: 4, delay: 6000 }, // Show bot response
      { step: 5, delay: 8000 }, // Show suggestion
      { step: 6, delay: 10000 }, // Show second user message
      { step: 7, delay: 11000 }, // Show second typing
      { step: 8, delay: 13000 }, // Show second bot response
    ];

    const timeouts: NodeJS.Timeout[] = [];

    animationSequence.forEach(({ step, delay }) => {
      const timeout = setTimeout(() => {
        setCurrentStep(step);
        if (step === 1) setIsRecording(true);
        if (step === 2) setIsRecording(false);

        // Отмечаем завершение анимации на последнем шаге
        if (step === 8) {
          setAnimationComplete(true);
        }
      }, delay);
      timeouts.push(timeout);
    });

    // Убираем сброс цикла - теперь сообщения остаются видимыми
    // const resetTimeout = setTimeout(() => {
    //   setCurrentStep(0);
    //   setIsRecording(false);
    // }, 15000);
    // timeouts.push(resetTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <section className="section section-gradient relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="from-primary/10 to-accent/10 absolute top-0 left-0 h-full w-full bg-gradient-to-br"></div>
        <div className="border-primary/10 animate-rotate-slow absolute top-1/4 left-1/6 h-16 w-16 rotate-45 border"></div>
        <div
          className="border-accent/10 animate-rotate-slow absolute right-1/5 bottom-1/3 h-12 w-12 rotate-12 border"
          style={{ animationDirection: "reverse" }}
        ></div>
      </div>

      <div className="container-default relative z-10 text-center">
        <div className="mb-6 sm:mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/50 rounded-full px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm">
            <Sparkles className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            {t("badge")}
          </Badge>
        </div>

        <h1
          className="animate-fade-in-up mb-6 text-4xl leading-tight font-bold sm:mb-8 sm:text-6xl md:text-8xl"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="animate-gradient-x inline-block cursor-pointer bg-gradient-to-r from-green-600 via-green-400 to-green-600 bg-[length:200%_auto] bg-clip-text font-serif text-transparent transition-all duration-500">
            Synoro
          </span>
          <br />
          <span className="text-muted-foreground text-2xl font-normal sm:text-4xl md:text-5xl">
            {t("title")}
          </span>
        </h1>

        <p
          className="heading-subtitle text-muted-foreground animate-fade-in-up mx-auto mb-6 max-w-3xl sm:mb-8"
          style={{ animationDelay: "0.4s" }}
        >
          {t("subtitle")}
        </p>

        <div className="mt-6 mb-12 flex flex-col justify-center gap-4 px-4 sm:mt-8 sm:mb-16 sm:flex-row sm:gap-6 sm:px-0">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 w-full rounded-xl px-6 py-3 font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:shadow-xl sm:w-auto sm:px-8"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {t("startBeta")}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary w-full rounded-xl bg-transparent px-6 py-3 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl sm:w-auto sm:px-8"
          >
            <Play className="mr-2 h-4 w-4" />
            {t("seeDemo")}
          </Button>
        </div>

        <div
          className="animate-fade-in-up relative mx-auto max-w-sm sm:max-w-md"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="glass-effect border-primary/30 bg-background/95 relative mx-2 rounded-3xl border p-4 backdrop-blur-xl sm:mx-0 sm:p-6">
            {/* Chat Header */}
            <div className="border-primary/10 mb-4 flex items-center gap-3 border-b pb-3 sm:mb-6 sm:gap-4 sm:pb-4">
              <div className="relative">
                <div className="from-primary to-accent flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br sm:h-12 sm:w-12">
                  <MessageSquare className="text-primary-foreground h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="absolute -right-1 -bottom-1 h-4 w-4 animate-pulse rounded-full border-2 border-white bg-green-500"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-foreground text-sm font-semibold sm:text-base">
                  {t("aiName")}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {t("aiStatus")}
                </p>
              </div>
              {(isRecording || animationComplete) && (
                <div className="animate-fade-in flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                  <Mic className="h-4 w-4 animate-pulse text-red-500" />
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent max-h-[350px] space-y-3 overflow-x-hidden overflow-y-auto sm:max-h-[400px] sm:space-y-4">
              {(currentStep === 1 || animationComplete) && (
                <div className="animate-scale-in flex justify-center">
                  <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 sm:px-4 sm:py-3">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                    <span className="text-xs text-red-600 sm:text-sm">
                      {t("recording")}
                    </span>
                    <Mic className="h-4 w-4 text-red-500" />
                  </div>
                </div>
              )}

              {/* User Message 1 */}
              {(currentStep >= 2 || animationComplete) && (
                <div className="animate-slide-in-right flex justify-end">
                  <div className="bg-primary text-primary-foreground animate-message-pop max-w-[85%] rounded-2xl rounded-tr-md px-3 py-2 sm:max-w-[80%] sm:px-4 sm:py-3">
                    <p className="text-xs sm:text-sm">{t("userMessage1")}</p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <span className="text-[10px] opacity-70 sm:text-xs">
                        14:32
                      </span>
                      <CheckCircle className="animate-check-mark h-3 w-3 opacity-70" />
                    </div>
                  </div>
                </div>
              )}

              {/* Typing Indicator 1 */}
              {(currentStep === 3 || animationComplete) && (
                <div className="animate-slide-in-left flex justify-start">
                  <div className="bg-muted animate-bounce-subtle max-w-[85%] rounded-2xl rounded-tl-md px-3 py-2 sm:max-w-[80%] sm:px-4 sm:py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-xs sm:text-sm">
                        {t("aiAnalyzing")}
                      </span>
                      <div className="ml-2 flex gap-1">
                        <div
                          className="bg-primary animate-typing-dot h-1.5 w-1.5 rounded-full"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="bg-primary animate-typing-dot h-1.5 w-1.5 rounded-full"
                          style={{ animationDelay: "200ms" }}
                        ></div>
                        <div
                          className="bg-primary animate-typing-dot h-1.5 w-1.5 rounded-full"
                          style={{ animationDelay: "400ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bot Response 1 */}
              {(currentStep >= 4 || animationComplete) && (
                <div className="animate-slide-in-left flex justify-start">
                  <div className="bg-muted animate-message-pop max-w-[85%] rounded-2xl rounded-tl-md px-3 py-2 sm:max-w-[80%] sm:px-4 sm:py-3">
                    <p className="text-xs sm:text-sm">{t("aiResponse1")}</p>
                    <div className="mt-1 flex items-center justify-start gap-1">
                      <span className="text-muted-foreground text-[10px] sm:text-xs">
                        14:33
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Suggestion */}
              {(currentStep >= 5 || animationComplete) && (
                <div
                  className="animate-slide-in-left flex justify-start"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="bg-accent/10 border-accent/20 animate-glow-pulse max-w-[85%] rounded-2xl rounded-tl-md border px-3 py-2 sm:max-w-[80%] sm:px-4 sm:py-3">
                    <p className="text-accent text-xs sm:text-sm">
                      {t("aiSuggestion")}
                    </p>
                  </div>
                </div>
              )}

              {/* User Message 2 */}
              {(currentStep >= 6 || animationComplete) && (
                <div
                  className="animate-slide-in-right flex justify-end"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="bg-primary text-primary-foreground animate-message-pop max-w-[80%] rounded-2xl rounded-tr-md px-4 py-3">
                    <p className="text-sm">{t("userMessage2")}</p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <span className="text-xs opacity-70">14:35</span>
                      <CheckCircle className="animate-check-mark h-3 w-3 opacity-70" />
                    </div>
                  </div>
                </div>
              )}

              {/* Typing Indicator 2 */}
              {(currentStep === 7 || animationComplete) && (
                <div className="animate-slide-in-left flex justify-start">
                  <div className="bg-muted max-w-[80%] rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-sm">
                        {t("scheduling")}
                      </span>
                      <div className="ml-2 flex gap-1">
                        <div
                          className="bg-primary animate-typing-dot h-1.5 w-1.5 rounded-full"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="bg-primary animate-typing-dot h-1.5 w-1.5 rounded-full"
                          style={{ animationDelay: "200ms" }}
                        ></div>
                        <div
                          className="bg-primary animate-typing-dot h-1.5 w-1.5 rounded-full"
                          style={{ animationDelay: "400ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bot Response 2 */}
              {(currentStep >= 8 || animationComplete) && (
                <div className="animate-slide-in-left flex justify-start">
                  <div className="bg-muted animate-message-pop max-w-[80%] rounded-2xl rounded-tl-md px-4 py-3">
                    <p className="text-sm">{t("aiResponse2")}</p>
                    <div className="mt-1 flex items-center justify-start gap-1">
                      <span className="text-muted-foreground text-xs">
                        14:36
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Preview */}
            <div className="border-primary/10 mt-4 border-t pt-3 sm:mt-6 sm:pt-4">
              <div className="text-muted-foreground flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
                <div className="bg-primary/10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8">
                  <MessageSquare className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="flex-1 leading-relaxed italic">
                  {t("inputHint")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
