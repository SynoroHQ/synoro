import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, MessageSquare, Target, BarChart3, Clock, Award, Shield } from "lucide-react"

export default function Features() {
  return (
    <section id="features" className="py-32 px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-2 text-sm font-medium rounded-full mb-6 hover:bg-primary/20 hover:scale-105 transition-all duration-300">
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            Features
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 font-serif">Key Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the powerful features that make Synoro the ultimate smart assistant for your daily life.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-card/80 backdrop-blur-sm relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                <MessageSquare className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-300">
                Smart Task Logging
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Effortlessly log tasks and events via text or voice messages with intelligent categorization.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-card/80 backdrop-blur-sm relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
                <Target className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors duration-300">
                AI-Powered Insights
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Leverage AI to automatically understand and categorize your entries with context awareness.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-card/80 backdrop-blur-sm relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all duration-300">
                <BarChart3 className="w-6 h-6 text-teal-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-teal-600 transition-colors duration-300">
                Analytics & Reports
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Gain detailed insights and visual reports of your activities with predictive analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-card/80 backdrop-blur-sm relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 group-hover:scale-110 transition-all duration-300">
                <Clock className="w-6 h-6 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-orange-600 transition-colors duration-300">
                Smart Reminders
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Receive intelligent notifications based on your patterns and predictive scheduling.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-card/80 backdrop-blur-sm relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300">
                <Award className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors duration-300">
                Gamified Productivity
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Turn your daily tasks into a fun game with rewards and achievements.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-card/80 backdrop-blur-sm relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300">
                <Shield className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                Secure & Private
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Enterprise-grade security ensures your personal data remains private and encrypted.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  )
}
