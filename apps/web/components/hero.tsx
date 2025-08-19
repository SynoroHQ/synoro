"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageSquare, Mic, Play, Sparkles } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('Hero');
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

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
      }, delay);
      timeouts.push(timeout);
    });

    // Reset cycle
    const resetTimeout = setTimeout(() => {
      setCurrentStep(0);
      setIsRecording(false);
    }, 15000);
    timeouts.push(resetTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-20">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="from-primary/10 to-accent/10 absolute top-0 left-0 h-full w-full bg-gradient-to-br"></div>
        <div className="border-primary/10 animate-rotate-slow absolute top-1/4 left-1/6 h-16 w-16 rotate-45 border"></div>
        <div
          className="border-accent/10 animate-rotate-slow absolute right-1/5 bottom-1/3 h-12 w-12 rotate-12 border"
          style={{ animationDirection: "reverse" }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-5xl pt-20 text-center">
        <div className="mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/50 rounded-full px-4 py-2 text-sm font-medium">
            <Sparkles className="mr-2 h-4 w-4" />
            {t('badge')}
          </Badge>
        </div>

        <h1
          className="animate-fade-in-up mb-8 text-6xl leading-tight font-bold md:text-8xl"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="animate-gradient-x inline-block cursor-pointer bg-gradient-to-r from-green-600 via-green-400 to-green-600 bg-[length:200%_auto] bg-clip-text font-serif text-transparent transition-all duration-500">
            Synoro
          </span>
          <br />
          <span className="text-muted-foreground text-4xl font-normal md:text-5xl">
            {t('title')}
          </span>
        </h1>

        <p
          className="text-muted-foreground animate-fade-in-up mx-auto mb-12 max-w-3xl text-xl leading-relaxed"
          style={{ animationDelay: "0.4s" }}
        >
          {t('subtitle')}
        </p>

        <div className="mb-16 flex flex-col justify-center gap-6 sm:flex-row">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 rounded-xl px-8 py-3 font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {t('startTrial')}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary rounded-xl bg-transparent px-8 py-3 font-semibold shadow-lg transition-all duration-300 hover:text-gray-900 hover:shadow-xl"
          >
            <Play className="mr-2 h-4 w-4" />
            {t('seeDemo')}
          </Button>
        </div>

        <div
          className="animate-fade-in-up relative mx-auto max-w-md"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="glass-effect border-primary/30 bg-background/95 relative rounded-3xl border p-6 backdrop-blur-xl">
            {/* Chat Header */}
            <div className="border-primary/10 mb-6 flex items-center gap-4 border-b pb-4">
              <div className="relative">
                <div className="from-primary to-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br">
                  <MessageSquare className="text-primary-foreground h-6 w-6" />
                </div>
                <div className="absolute -right-1 -bottom-1 h-4 w-4 animate-pulse rounded-full border-2 border-white bg-green-500"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-semibold">Synoro AI</h3>
                <p className="text-muted-foreground text-sm">
                  Online • Smart Assistant
                </p>
              </div>
              {isRecording && (
                <div className="animate-fade-in flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                  <Mic className="h-4 w-4 animate-pulse text-red-500" />
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent max-h-[400px] space-y-4 overflow-x-hidden overflow-y-auto">
              {currentStep === 1 && (
                <div className="animate-scale-in flex justify-center">
                  <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                    <span className="text-sm text-red-600">
                      Recording voice message...
                    </span>
                    <Mic className="h-4 w-4 text-red-500" />
                  </div>
                </div>
              )}

              {/* User Message 1 */}
              {currentStep >= 2 && (
                <div className="animate-slide-in-right flex justify-end">
                  <div className="bg-primary text-primary-foreground animate-message-pop max-w-[80%] rounded-2xl rounded-tr-md px-4 py-3">
                    <p className="text-sm">
                      🔧 Finished oil change and tire rotation on my Honda. Took
                      2 hours total.
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <span className="text-xs opacity-70">14:32</span>
                      <CheckCircle className="animate-check-mark h-3 w-3 opacity-70" />
                    </div>
                  </div>
                </div>
              )}

              {/* Typing Indicator 1 */}
              {currentStep === 3 && (
                <div className="animate-slide-in-left flex justify-start">
                  <div className="bg-muted animate-bounce-subtle max-w-[80%] rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-sm">
                        Synoro AI is analyzing
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
              {currentStep >= 4 && (
                <div className="animate-slide-in-left flex justify-start">
                  <div className="bg-muted animate-message-pop max-w-[80%] rounded-2xl rounded-tl-md px-4 py-3">
                    <p className="text-sm">
                      ✅ Vehicle maintenance logged: Oil change + tire rotation
                      (2h). Next service due in 3,000 miles. Great job staying
                      on schedule!
                    </p>
                    <div className="mt-1 flex items-center justify-start gap-1">
                      <span className="text-muted-foreground text-xs">
                        14:33
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Suggestion */}
              {currentStep >= 5 && (
                <div
                  className="animate-slide-in-left flex justify-start"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="bg-accent/10 border-accent/20 animate-glow-pulse max-w-[80%] rounded-2xl rounded-tl-md border px-4 py-3">
                    <p className="text-accent text-sm">
                      💡 Based on your maintenance pattern, I recommend
                      scheduling brake inspection next month.
                    </p>
                  </div>
                </div>
              )}

              {/* User Message 2 */}
              {currentStep >= 6 && (
                <div
                  className="animate-slide-in-right flex justify-end"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="bg-primary text-primary-foreground animate-message-pop max-w-[80%] rounded-2xl rounded-tr-md px-4 py-3">
                    <p className="text-sm">
                      📅 Schedule brake inspection for next month
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <span className="text-xs opacity-70">14:35</span>
                      <CheckCircle className="h-3 w-3 opacity-70" />
                    </div>
                  </div>
                </div>
              )}

              {/* Typing Indicator 2 */}
              {currentStep === 7 && (
                <div className="animate-slide-in-left flex justify-start">
                  <div className="bg-muted max-w-[80%] rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-sm">
                        Scheduling...
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
              {currentStep >= 8 && (
                <div className="animate-slide-in-left flex justify-start">
                  <div className="bg-muted animate-message-pop max-w-[80%] rounded-2xl rounded-tl-md px-4 py-3">
                    <p className="text-sm">
                      ✅ Brake inspection scheduled for March 15th at 10:00 AM.
                      Reminder set for 2 days before.
                    </p>
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
            <div className="border-primary/10 mt-6 border-t pt-4">
              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                  <MessageSquare className="text-primary h-4 w-4" />
                </div>
                <span className="flex-1 italic">
                  Try: "Washed car, $15 at car wash" or "Changed air filter"
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
