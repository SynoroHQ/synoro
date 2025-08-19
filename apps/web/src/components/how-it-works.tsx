import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { BarChart3, MessageSquare, Zap } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="features" className="bg-muted/30 px-4 py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <Badge className="bg-accent/10 text-accent border-accent/20 mb-6 rounded-full px-4 py-2 text-sm font-medium">
            <Zap className="mr-2 h-4 w-4" />
            How It Works
          </Badge>
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            Simple. Smart. Efficient.
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Three easy steps to transform your productivity and gain valuable
            insights into your daily activities.
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
                  1. Speak Naturally
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Simply tell Synoro what you've accomplished. Use voice
                  commands or text - our AI understands natural language
                  perfectly.
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
                <CardTitle className="mb-4 text-2xl">2. AI Processes</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Our intelligent system categorizes, timestamps, and analyzes
                  your activities to provide meaningful insights and patterns.
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
                <CardTitle className="mb-4 text-2xl">3. Get Insights</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Receive personalized analytics, time-saving suggestions, and
                  smart recommendations to optimize your daily routine.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
