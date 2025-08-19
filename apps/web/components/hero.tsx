"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Play, MessageSquare, CheckCircle, Mic } from "lucide-react"

export default function Hero() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isRecording, setIsRecording] = useState(false)

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
    ]

    const timeouts: NodeJS.Timeout[] = []

    animationSequence.forEach(({ step, delay }) => {
      const timeout = setTimeout(() => {
        setCurrentStep(step)
        if (step === 1) setIsRecording(true)
        if (step === 2) setIsRecording(false)
      }, delay)
      timeouts.push(timeout)
    })

    // Reset cycle
    const resetTimeout = setTimeout(() => {
      setCurrentStep(0)
      setIsRecording(false)
    }, 15000)
    timeouts.push(resetTimeout)

    return () => timeouts.forEach(clearTimeout)
  }, [])

  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <div className="absolute top-1/4 left-1/6 w-16 h-16 border border-primary/10 rotate-45 animate-rotate-slow"></div>
        <div
          className="absolute bottom-1/3 right-1/5 w-12 h-12 border border-accent/10 rotate-12 animate-rotate-slow"
          style={{ animationDirection: "reverse" }}
        ></div>
      </div>

      <div className="container mx-auto text-center max-w-5xl relative z-10 pt-20">
        <div className="mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/50 px-4 py-2 text-sm font-medium rounded-full">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Smart Assistant
          </Badge>
        </div>

        <h1
          className="text-6xl md:text-8xl font-bold mb-8 leading-tight animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="bg-gradient-to-r from-green-600 via-green-400 to-green-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x font-serif transition-all duration-500 inline-block cursor-pointer">
            Synoro
          </span>
          <br />
          <span className="text-4xl md:text-5xl text-muted-foreground font-normal">Your Smart Home Assistant</span>
        </h1>

        <p
          className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          Transform your daily routine with AI-powered task management. Log activities with voice commands, get
          intelligent insights, and optimize your time like never before.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-gray-900 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Your Free Trial
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-gray-900 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
          >
            <Play className="w-4 h-4 mr-2" />
            See Live Demo
          </Button>
        </div>

        <div className="relative max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          <div className="relative glass-effect rounded-3xl p-6 border border-primary/30 backdrop-blur-xl bg-background/95">
            {/* Chat Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-primary/10">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Synoro AI</h3>
                <p className="text-sm text-muted-foreground">Online • Smart Assistant</p>
              </div>
              {isRecording && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <Mic className="w-4 h-4 text-red-500 animate-pulse" />
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {currentStep === 1 && (
                <div className="flex justify-center animate-scale-in">
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-600">Recording voice message...</span>
                    <Mic className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              )}

              {/* User Message 1 */}
              {currentStep >= 2 && (
                <div className="flex justify-end animate-slide-in-right">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] animate-message-pop">
                    <p className="text-sm">🔧 Finished oil change and tire rotation on my Honda. Took 2 hours total.</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">14:32</span>
                      <CheckCircle className="w-3 h-3 opacity-70 animate-check-mark" />
                    </div>
                  </div>
                </div>
              )}

              {/* Typing Indicator 1 */}
              {currentStep === 3 && (
                <div className="flex justify-start animate-slide-in-left">
                  <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%] animate-bounce-subtle">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">Synoro AI is analyzing</span>
                      <div className="flex gap-1 ml-2">
                        <div
                          className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot"
                          style={{ animationDelay: "200ms" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot"
                          style={{ animationDelay: "400ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bot Response 1 */}
              {currentStep >= 4 && (
                <div className="flex justify-start animate-slide-in-left">
                  <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%] animate-message-pop">
                    <p className="text-sm">
                      ✅ Vehicle maintenance logged: Oil change + tire rotation (2h). Next service due in 3,000 miles.
                      Great job staying on schedule!
                    </p>
                    <div className="flex items-center justify-start gap-1 mt-1">
                      <span className="text-xs text-muted-foreground">14:33</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Suggestion */}
              {currentStep >= 5 && (
                <div className="flex justify-start animate-slide-in-left" style={{ animationDelay: "0.5s" }}>
                  <div className="bg-accent/10 border border-accent/20 rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%] animate-glow-pulse">
                    <p className="text-sm text-accent">
                      💡 Based on your maintenance pattern, I recommend scheduling brake inspection next month.
                    </p>
                  </div>
                </div>
              )}

              {/* User Message 2 */}
              {currentStep >= 6 && (
                <div className="flex justify-end animate-slide-in-right" style={{ animationDelay: "0.3s" }}>
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] animate-message-pop">
                    <p className="text-sm">📅 Schedule brake inspection for next month</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">14:35</span>
                      <CheckCircle className="w-3 h-3 opacity-70" />
                    </div>
                  </div>
                </div>
              )}

              {/* Typing Indicator 2 */}
              {currentStep === 7 && (
                <div className="flex justify-start animate-slide-in-left">
                  <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">Scheduling...</span>
                      <div className="flex gap-1 ml-2">
                        <div
                          className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot"
                          style={{ animationDelay: "200ms" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot"
                          style={{ animationDelay: "400ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bot Response 2 */}
              {currentStep >= 8 && (
                <div className="flex justify-start animate-slide-in-left">
                  <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%] animate-message-pop">
                    <p className="text-sm">
                      ✅ Brake inspection scheduled for March 15th at 10:00 AM. Reminder set for 2 days before.
                    </p>
                    <div className="flex items-center justify-start gap-1 mt-1">
                      <span className="text-xs text-muted-foreground">14:36</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Preview */}
            <div className="mt-6 pt-4 border-t border-primary/10">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <span className="flex-1 italic">Try: "Washed car, $15 at car wash" or "Changed air filter"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
