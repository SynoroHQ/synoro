import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Car,
  CheckCircle,
  Clock,
  Home,
  Play,
  Sparkles,
  Target,
  User,
  Users,
} from "lucide-react";

export default function WhoBenefits() {
  return (
    <section
      id="for-whom"
      className="from-background to-muted/20 bg-gradient-to-br px-4 py-32"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 mb-6 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105">
            <Users className="mr-2 h-4 w-4" />
            Who Benefits
          </Badge>
          <h2 className="mb-6 font-serif text-5xl font-bold md:text-6xl">
            Perfect For Everyone
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
            Discover how Synoro transforms daily life for different user groups
            with tailored solutions and intelligent insights.
          </p>
        </div>

        <div className="space-y-24">
          {/* Families Section */}
          <div className="group">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-3xl font-bold text-blue-600">
                      Families
                    </h3>
                    <p className="text-muted-foreground">
                      Smart household management for busy families
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      Expense Tracking Made Simple
                    </h4>
                    <p className="text-sm leading-relaxed text-blue-800">
                      "Just bought groceries for $85 at Whole Foods" - instantly
                      categorized and tracked across family budgets with smart
                      spending insights.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      Chore Management
                    </h4>
                    <p className="text-sm leading-relaxed text-blue-800">
                      Track completed household tasks, assign responsibilities,
                      and celebrate family achievements with gamified progress
                      tracking.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        <span className="text-sm font-bold">💡</span>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold">
                          Real Family Success
                        </h4>
                        <p className="text-sm text-blue-100 italic">
                          "Synoro helped us save $400/month by tracking our
                          spending patterns. The kids love earning points for
                          completing chores!" - Sarah M., Mother of 3
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 blur-xl"></div>
                  <div className="relative rounded-3xl border border-blue-100 bg-white p-8 shadow-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
                        <span className="font-medium text-blue-900">
                          Monthly Grocery Budget
                        </span>
                        <span className="font-bold text-blue-600">
                          $450 / $500
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">
                        <span className="font-medium text-green-900">
                          Chores Completed
                        </span>
                        <span className="font-bold text-green-600">
                          23 / 25 this week
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-purple-50 p-4">
                        <span className="font-medium text-purple-900">
                          Family Savings Goal
                        </span>
                        <span className="font-bold text-purple-600">
                          78% achieved
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Car Owners Section */}
          <div className="group">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-500/20 to-purple-600/20 blur-xl"></div>
                <div className="relative rounded-3xl border border-purple-100 bg-white p-8 shadow-2xl">
                  <div className="space-y-4">
                    <div className="mb-6 text-center">
                      <Car className="mx-auto mb-3 h-12 w-12 text-purple-600" />
                      <h4 className="font-bold text-purple-900">
                        Vehicle Maintenance Tracker
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-purple-900">
                          Oil Change - 3,000 miles ago
                        </span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm text-yellow-900">
                          Brake Inspection - Due in 500 miles
                        </span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3">
                        <Target className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-900">
                          Tire Rotation - Overdue by 200 miles
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-3xl font-bold text-purple-600">
                      Car Owners
                    </h3>
                    <p className="text-muted-foreground">
                      Never miss maintenance with intelligent tracking
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-purple-100 bg-purple-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-purple-900">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      Predictive Maintenance
                    </h4>
                    <p className="text-sm leading-relaxed text-purple-800">
                      AI analyzes your driving patterns and maintenance history
                      to predict when services are needed, preventing costly
                      breakdowns.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-purple-100 bg-purple-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-purple-900">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      Cost Optimization
                    </h4>
                    <p className="text-sm leading-relaxed text-purple-800">
                      Track maintenance costs, find the best service deals, and
                      budget for upcoming repairs with smart financial planning.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        <span className="text-sm font-bold">🚗</span>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold">
                          Driver Testimonial
                        </h4>
                        <p className="text-sm text-purple-100 italic">
                          "Synoro saved me $800 by catching a potential
                          transmission issue early. The maintenance reminders
                          are spot-on!" - Mike R., Daily Commuter
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Homeowners Section */}
          <div className="group">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-xl">
                    <Home className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-3xl font-bold text-teal-600">
                      Homeowners
                    </h3>
                    <p className="text-muted-foreground">
                      Comprehensive property management made easy
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-teal-100 bg-teal-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-teal-900">
                      <CheckCircle className="h-5 w-5 text-teal-600" />
                      Maintenance Scheduling
                    </h4>
                    <p className="text-sm leading-relaxed text-teal-800">
                      "Fixed leaky faucet in master bathroom" - automatically
                      schedules follow-up inspections and tracks warranty
                      information.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-teal-100 bg-teal-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-teal-900">
                      <CheckCircle className="h-5 w-5 text-teal-600" />
                      Seasonal Reminders
                    </h4>
                    <p className="text-sm leading-relaxed text-teal-800">
                      Get intelligent reminders for seasonal tasks like gutter
                      cleaning, HVAC maintenance, and winterization based on
                      your location.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        <span className="text-sm font-bold">🏠</span>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold">
                          Homeowner Success
                        </h4>
                        <p className="text-sm text-teal-100 italic">
                          "Synoro's maintenance tracking increased my home value
                          by $15,000. I never miss important upkeep tasks
                          anymore!" - Jennifer L., Homeowner
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-teal-500/20 to-teal-600/20 blur-xl"></div>
                  <div className="relative rounded-3xl border border-teal-100 bg-white p-8 shadow-2xl">
                    <div className="mb-6 text-center">
                      <Home className="mx-auto mb-3 h-12 w-12 text-teal-600" />
                      <h4 className="font-bold text-teal-900">
                        Property Dashboard
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-teal-50 p-4 text-center">
                          <div className="text-2xl font-bold text-teal-600">
                            12
                          </div>
                          <div className="text-xs text-teal-800">
                            Tasks Completed
                          </div>
                        </div>
                        <div className="rounded-xl bg-green-50 p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            $2.4K
                          </div>
                          <div className="text-xs text-green-800">
                            Maintenance Saved
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-yellow-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-900">
                            Upcoming Tasks
                          </span>
                        </div>
                        <div className="text-xs text-yellow-800">
                          Gutter cleaning due in 2 weeks
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Freelancers Section */}
          <div className="group">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 blur-xl"></div>
                <div className="relative rounded-3xl border border-orange-100 bg-white p-8 shadow-2xl">
                  <div className="mb-6 text-center">
                    <User className="mx-auto mb-3 h-12 w-12 text-orange-600" />
                    <h4 className="font-bold text-orange-900">
                      Productivity Insights
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-xl bg-orange-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-orange-900">
                          Focus Time Today
                        </span>
                        <span className="font-bold text-orange-600">6.5h</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-orange-200">
                        <div
                          className="h-2 rounded-full bg-orange-500"
                          style={{ width: "81%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          15
                        </div>
                        <div className="text-xs text-blue-800">
                          Projects Active
                        </div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3 text-center">
                        <div className="text-lg font-bold text-green-600">
                          92%
                        </div>
                        <div className="text-xs text-green-800">
                          On-Time Delivery
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-3xl font-bold text-orange-600">
                      Freelancers
                    </h3>
                    <p className="text-muted-foreground">
                      Optimize productivity and work-life balance
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-orange-900">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      Time & Project Tracking
                    </h4>
                    <p className="text-sm leading-relaxed text-orange-800">
                      "Completed client website design - 4 hours" -
                      automatically categorizes work time, tracks project
                      progress, and calculates earnings.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-orange-900">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      Health & Wellness
                    </h4>
                    <p className="text-sm leading-relaxed text-orange-800">
                      Monitor work breaks, exercise routines, and mental health
                      check-ins to maintain optimal productivity and well-being.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        <span className="text-sm font-bold">💼</span>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold">
                          Freelancer Success
                        </h4>
                        <p className="text-sm text-orange-100 italic">
                          "Synoro helped me increase my hourly rate by 40%
                          through better time tracking and productivity
                          insights. Game changer!" - Alex K., Graphic Designer
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="from-primary/10 to-accent/10 border-primary/20 rounded-3xl border bg-gradient-to-r p-12">
            <h3 className="mb-4 text-3xl font-bold">
              Ready to Transform Your Daily Routine?
            </h3>
            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl">
              Join thousands of users who have already optimized their lives
              with Synoro's intelligent assistance.
            </p>
            <div className="flex flex-col justify-center gap-6 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 rounded-xl px-8 py-3 font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Your Free Trial
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary rounded-xl bg-transparent px-8 py-3 font-semibold shadow-lg transition-all duration-300 hover:text-gray-900 hover:shadow-xl"
              >
                <Play className="mr-2 h-4 w-4" />
                See Live Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
