import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CheckCircle, Zap, Sparkles, Shield } from "lucide-react"

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <Badge className="bg-gradient-to-r from-accent/10 to-primary/10 text-accent border border-accent/30 px-6 py-3 text-sm font-medium rounded-full mb-6 hover:bg-gradient-to-r hover:from-accent/20 hover:to-primary/20 hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm">
            <Zap className="w-4 h-4 mr-2 animate-pulse" />
            Pricing
          </Badge>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 font-serif bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Find the perfect plan to supercharge your productivity and simplify your life.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {/* Free Plan */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-card/90 backdrop-blur-sm flex flex-col h-full group-hover:bg-card/95">
              <CardHeader className="text-center pb-6 relative">
                <div className="absolute top-4 right-4 w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground font-bold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                  1
                </div>
                <CardTitle className="text-3xl font-bold font-serif mb-2 group-hover:text-primary transition-colors duration-300">
                  Free
                </CardTitle>
                <CardDescription className="text-base mb-6 group-hover:text-foreground/80 transition-colors duration-300">
                  Perfect for getting started
                </CardDescription>
                <div className="text-5xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                  $0<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col px-6">
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      Basic task logging
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300"
                    style={{ transitionDelay: "50ms" }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      Telegram integration
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300"
                    style={{ transitionDelay: "100ms" }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">Basic reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Premium Plan - Most Popular */}
          <div className="group relative transform md:scale-110 md:-mt-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
            <Card className="relative border-2 border-primary shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 bg-card flex flex-col h-full">
              <Badge className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground px-8 py-3 rounded-full shadow-xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 border-2 border-primary-foreground/20 backdrop-blur-sm z-10">
                <Sparkles className="w-5 h-5 mr-2 animate-spin" style={{ animationDuration: "3s" }} />
                Most Popular
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 rounded-full blur-md -z-10 animate-pulse"></div>
              </Badge>
              <CardHeader className="text-center pb-6 pt-8 relative">
                <div className="absolute top-6 right-4 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg opacity-0 group-hover:opacity-100 transition-all duration-300 animate-bounce">
                  ⭐
                </div>
                <CardTitle className="text-3xl font-bold font-serif mb-2 group-hover:text-primary transition-colors duration-300">
                  Premium
                </CardTitle>
                <CardDescription className="text-base mb-6 group-hover:text-foreground/80 transition-colors duration-300">
                  Advanced features for power users
                </CardDescription>
                <div className="text-5xl font-bold mb-4 text-foreground group-hover:scale-110 transition-transform duration-300">
                  $12<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col px-6">
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      Everything in Free
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300"
                    style={{ transitionDelay: "50ms" }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      Advanced analytics
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300"
                    style={{ transitionDelay: "100ms" }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">Smart reminders</span>
                  </li>
                  <li
                    className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300"
                    style={{ transitionDelay: "150ms" }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">Receipt analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Family Plan */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-card/90 backdrop-blur-sm flex flex-col h-full group-hover:bg-card/95">
              <CardHeader className="text-center pb-6 relative">
                <div className="absolute top-4 right-4 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                  👨‍👩‍👧‍👦
                </div>
                <CardTitle className="text-3xl font-bold font-serif mb-2 group-hover:text-accent transition-colors duration-300">
                  Family
                </CardTitle>
                <CardDescription className="text-base mb-6 group-hover:text-foreground/80 transition-colors duration-300">
                  Perfect for families and teams
                </CardDescription>
                <div className="text-5xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                  $20<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col px-6">
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      Everything in Premium
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300"
                    style={{ transitionDelay: "50ms" }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      Multi-user access
                    </span>
                  </li>
                  <li
                    className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300"
                    style={{ transitionDelay: "100ms" }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">Shared analytics</span>
                  </li>
                  <li
                    className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300"
                    style={{ transitionDelay: "150ms" }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:text-foreground transition-colors duration-300">Family insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 hover:text-foreground transition-colors duration-300">
              <Shield className="w-4 h-4 text-primary" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors duration-300">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors duration-300">
              <Zap className="w-4 h-4 text-primary" />
              <span>Instant activation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
