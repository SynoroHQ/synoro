import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle, Car, Home, User, Clock, Target, Sparkles, Play } from "lucide-react"

export default function WhoBenefits() {
  return (
    <section id="for-whom" className="py-32 px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-6 py-3 text-sm font-medium rounded-full mb-6 hover:bg-primary/20 hover:scale-105 transition-all duration-300">
            <Users className="w-4 h-4 mr-2" />
            Who Benefits
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 font-serif">Perfect For Everyone</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover how Synoro transforms daily life for different user groups with tailored solutions and intelligent
            insights.
          </p>
        </div>

        <div className="space-y-24">
          {/* Families Section */}
          <div className="group">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-blue-600 mb-2">Families</h3>
                    <p className="text-muted-foreground">Smart household management for busy families</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Expense Tracking Made Simple
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      "Just bought groceries for $85 at Whole Foods" - instantly categorized and tracked across family
                      budgets with smart spending insights.
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Chore Management
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      Track completed household tasks, assign responsibilities, and celebrate family achievements with
                      gamified progress tracking.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold">💡</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Real Family Success</h4>
                        <p className="text-blue-100 text-sm italic">
                          "Synoro helped us save $400/month by tracking our spending patterns. The kids love earning
                          points for completing chores!" - Sarah M., Mother of 3
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-blue-100">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <span className="text-blue-900 font-medium">Monthly Grocery Budget</span>
                        <span className="text-blue-600 font-bold">$450 / $500</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                        <span className="text-green-900 font-medium">Chores Completed</span>
                        <span className="text-green-600 font-bold">23 / 25 this week</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                        <span className="text-purple-900 font-medium">Family Savings Goal</span>
                        <span className="text-purple-600 font-bold">78% achieved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Car Owners Section */}
          <div className="group">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-purple-100">
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <Car className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                      <h4 className="font-bold text-purple-900">Vehicle Maintenance Tracker</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-purple-900 text-sm">Oil Change - 3,000 miles ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        <span className="text-yellow-900 text-sm">Brake Inspection - Due in 500 miles</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <Target className="w-5 h-5 text-red-500" />
                        <span className="text-red-900 text-sm">Tire Rotation - Overdue by 200 miles</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <Car className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-purple-600 mb-2">Car Owners</h3>
                    <p className="text-muted-foreground">Never miss maintenance with intelligent tracking</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      Predictive Maintenance
                    </h4>
                    <p className="text-purple-800 text-sm leading-relaxed">
                      AI analyzes your driving patterns and maintenance history to predict when services are needed,
                      preventing costly breakdowns.
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      Cost Optimization
                    </h4>
                    <p className="text-purple-800 text-sm leading-relaxed">
                      Track maintenance costs, find the best service deals, and budget for upcoming repairs with smart
                      financial planning.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold">🚗</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Driver Testimonial</h4>
                        <p className="text-purple-100 text-sm italic">
                          "Synoro saved me $800 by catching a potential transmission issue early. The maintenance
                          reminders are spot-on!" - Mike R., Daily Commuter
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
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-teal-600 mb-2">Homeowners</h3>
                    <p className="text-muted-foreground">Comprehensive property management made easy</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
                    <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                      Maintenance Scheduling
                    </h4>
                    <p className="text-teal-800 text-sm leading-relaxed">
                      "Fixed leaky faucet in master bathroom" - automatically schedules follow-up inspections and tracks
                      warranty information.
                    </p>
                  </div>

                  <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
                    <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                      Seasonal Reminders
                    </h4>
                    <p className="text-teal-800 text-sm leading-relaxed">
                      Get intelligent reminders for seasonal tasks like gutter cleaning, HVAC maintenance, and
                      winterization based on your location.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold">🏠</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Homeowner Success</h4>
                        <p className="text-teal-100 text-sm italic">
                          "Synoro's maintenance tracking increased my home value by $15,000. I never miss important
                          upkeep tasks anymore!" - Jennifer L., Homeowner
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-teal-100">
                    <div className="text-center mb-6">
                      <Home className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="font-bold text-teal-900">Property Dashboard</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-teal-50 rounded-xl">
                          <div className="text-2xl font-bold text-teal-600">12</div>
                          <div className="text-teal-800 text-xs">Tasks Completed</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                          <div className="text-2xl font-bold text-green-600">$2.4K</div>
                          <div className="text-green-800 text-xs">Maintenance Saved</div>
                        </div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-yellow-900 font-medium text-sm">Upcoming Tasks</span>
                        </div>
                        <div className="text-yellow-800 text-xs">Gutter cleaning due in 2 weeks</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Freelancers Section */}
          <div className="group">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-orange-100">
                  <div className="text-center mb-6">
                    <User className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                    <h4 className="font-bold text-orange-900">Productivity Insights</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-orange-900 font-medium text-sm">Focus Time Today</span>
                        <span className="text-orange-600 font-bold">6.5h</span>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: "81%" }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">15</div>
                        <div className="text-blue-800 text-xs">Projects Active</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">92%</div>
                        <div className="text-green-800 text-xs">On-Time Delivery</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-orange-600 mb-2">Freelancers</h3>
                    <p className="text-muted-foreground">Optimize productivity and work-life balance</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                    <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                      Time & Project Tracking
                    </h4>
                    <p className="text-orange-800 text-sm leading-relaxed">
                      "Completed client website design - 4 hours" - automatically categorizes work time, tracks project
                      progress, and calculates earnings.
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                    <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                      Health & Wellness
                    </h4>
                    <p className="text-orange-800 text-sm leading-relaxed">
                      Monitor work breaks, exercise routines, and mental health check-ins to maintain optimal
                      productivity and well-being.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold">💼</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Freelancer Success</h4>
                        <p className="text-orange-100 text-sm italic">
                          "Synoro helped me increase my hourly rate by 40% through better time tracking and productivity
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
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-12 border border-primary/20">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Daily Routine?</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already optimized their lives with Synoro's intelligent assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
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
          </div>
        </div>
      </div>
    </section>
  )
}
