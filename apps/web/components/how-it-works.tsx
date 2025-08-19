import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquare, Zap, BarChart3 } from "lucide-react"

export default function HowItWorks() {
  return (
    <section id="features" className="py-32 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <Badge className="bg-accent/10 text-accent border-accent/20 px-4 py-2 text-sm font-medium rounded-full mb-6">
            <Zap className="w-4 h-4 mr-2" />
            How It Works
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple. Smart. Efficient.</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three easy steps to transform your productivity and gain valuable insights into your daily activities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          <div className="relative h-full">
            <Card className="relative h-full border-0 bg-card/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl mb-4">1. Speak Naturally</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Simply tell Synoro what you've accomplished. Use voice commands or text - our AI understands natural
                  language perfectly.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="relative h-full">
            <Card className="relative h-full border-0 bg-card/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl mb-4">2. AI Processes</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Our intelligent system categorizes, timestamps, and analyzes your activities to provide meaningful
                  insights and patterns.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="relative h-full">
            <Card className="relative h-full border-0 bg-card/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl mb-4">3. Get Insights</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Receive personalized analytics, time-saving suggestions, and smart recommendations to optimize your
                  daily routine.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
