import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Award,
  BarChart3,
  Clock,
  MessageSquare,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";

export default function Features() {
  return (
    <section
      id="features"
      className="from-background to-muted/20 bg-gradient-to-br px-4 py-32"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 mb-6 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105">
            <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
            Features
          </Badge>
          <h2 className="mb-6 font-serif text-5xl font-bold md:text-6xl">
            Key Features
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Explore the powerful features that make Synoro the ultimate smart
            assistant for your daily life.
          </p>
        </div>

        <div className="grid items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
                <MessageSquare className="h-6 w-6 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="mb-2 text-xl font-bold transition-colors duration-300 group-hover:text-blue-600">
                Smart Task Logging
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Effortlessly log tasks and events via text or voice messages
                with intelligent categorization.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/20">
                <Target className="h-6 w-6 text-purple-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="mb-2 text-xl font-bold transition-colors duration-300 group-hover:text-purple-600">
                AI-Powered Insights
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Leverage AI to automatically understand and categorize your
                entries with context awareness.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-500/20">
                <BarChart3 className="h-6 w-6 text-teal-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="mb-2 text-xl font-bold transition-colors duration-300 group-hover:text-teal-600">
                Analytics & Reports
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Gain detailed insights and visual reports of your activities
                with predictive analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500/20">
                <Clock className="h-6 w-6 text-orange-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="mb-2 text-xl font-bold transition-colors duration-300 group-hover:text-orange-600">
                Smart Reminders
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Receive intelligent notifications based on your patterns and
                predictive scheduling.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-500/20">
                <Award className="h-6 w-6 text-green-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="mb-2 text-xl font-bold transition-colors duration-300 group-hover:text-green-600">
                Gamified Productivity
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Turn your daily tasks into a fun game with rewards and
                achievements.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group bg-card/80 relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-500/20">
                <Shield className="h-6 w-6 text-indigo-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="mb-2 text-xl font-bold transition-colors duration-300 group-hover:text-indigo-600">
                Secure & Private
              </CardTitle>
              <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                Enterprise-grade security ensures your personal data remains
                private and encrypted.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
