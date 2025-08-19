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
import { useTranslations } from "next-intl";

export default function WhoBenefits() {
  const t = useTranslations("WhoBenefits");
  return (
    <section
      id="for-whom"
      className="from-background to-muted/20 bg-gradient-to-br px-4 py-32"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 mb-6 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105">
            <Users className="mr-2 h-4 w-4" />
            {t("badge")}
          </Badge>
          <h2 className="mb-6 font-serif text-5xl font-bold md:text-6xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
            {t("subtitle")}
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
                      {t("families.title")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("families.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      {t("families.expenseTracking.title")}
                    </h4>
                    <p className="text-sm leading-relaxed text-blue-800">
                      {t("families.expenseTracking.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      {t("families.choreManagement.title")}
                    </h4>
                    <p className="text-sm leading-relaxed text-blue-800">
                      {t("families.choreManagement.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        <span className="text-sm font-bold">💡</span>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold">
                          {t("families.successStory.title")}
                        </h4>
                        <p className="text-sm text-blue-100 italic">
                          {t("families.successStory.description")}
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
                          {t("dashboard.families.monthlyGroceryBudget")}
                        </span>
                        <span className="font-bold text-blue-600">
                          {t("dashboard.families.budgetValue")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">
                        <span className="font-medium text-green-900">
                          {t("dashboard.families.choresCompleted")}
                        </span>
                        <span className="font-bold text-green-600">
                          {t("dashboard.families.choresValue")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-purple-50 p-4">
                        <span className="font-medium text-purple-900">
                          {t("dashboard.families.familySavingsGoal")}
                        </span>
                        <span className="font-bold text-purple-600">
                          {t("dashboard.families.savingsValue")}
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
                        {t("dashboard.carOwners.vehicleMaintenanceTracker")}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-purple-900">
                          {t("dashboard.carOwners.oilChange")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm text-yellow-900">
                          {t("dashboard.carOwners.brakeInspection")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3">
                        <Target className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-900">
                          {t("dashboard.carOwners.tireRotation")}
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
                      {t("carOwners.title")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("carOwners.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-purple-100 bg-purple-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-purple-900">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      {t("carOwners.predictiveMaintenance.title")}
                    </h4>
                    <p className="text-sm leading-relaxed text-purple-800">
                      {t("carOwners.predictiveMaintenance.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-purple-100 bg-purple-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-purple-900">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      {t("carOwners.costOptimization.title")}
                    </h4>
                    <p className="text-sm leading-relaxed text-purple-800">
                      {t("carOwners.costOptimization.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        <span className="text-sm font-bold">🚗</span>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold">
                          {t("carOwners.testimonial.title")}
                        </h4>
                        <p className="text-sm text-purple-100 italic">
                          {t("carOwners.testimonial.description")}
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
                      {t("homeowners.title")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("homeowners.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-teal-100 bg-teal-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-teal-900">
                      <CheckCircle className="h-5 w-5 text-teal-600" />
                      {t("homeowners.maintenanceScheduling.title")}
                    </h4>
                    <p className="text-sm leading-relaxed text-teal-800">
                      {t("homeowners.maintenanceScheduling.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-teal-100 bg-teal-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-teal-900">
                      <CheckCircle className="h-5 w-5 text-teal-600" />
                      {t("homeowners.seasonalReminders.title")}
                    </h4>
                    <p className="text-sm leading-relaxed text-teal-800">
                      {t("homeowners.seasonalReminders.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        <span className="text-sm font-bold">🏠</span>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold">
                          {t("homeowners.successStory.title")}
                        </h4>
                        <p className="text-sm text-teal-100 italic">
                          {t("homeowners.successStory.description")}
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
                        {t("dashboard.homeowners.propertyDashboard")}
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-teal-50 p-4 text-center">
                          <div className="text-2xl font-bold text-teal-600">
                            {t("dashboard.homeowners.tasksCompletedValue")}
                          </div>
                          <div className="text-xs text-teal-800">
                            {t("dashboard.homeowners.tasksCompleted")}
                          </div>
                        </div>
                        <div className="rounded-xl bg-green-50 p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {t("dashboard.homeowners.maintenanceSavedValue")}
                          </div>
                          <div className="text-xs text-green-800">
                            {t("dashboard.homeowners.maintenanceSaved")}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-yellow-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-900">
                            {t("dashboard.homeowners.upcomingTasks")}
                          </span>
                        </div>
                        <div className="text-xs text-yellow-800">
                          {t("dashboard.families.gutterCleaningDue")}
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
                      {t("dashboard.freelancers.productivityInsights")}
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-xl bg-orange-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-orange-900">
                          {t("dashboard.freelancers.focusTimeToday")}
                        </span>
                        <span className="font-bold text-orange-600">
                          {t("dashboard.freelancers.focusTimeValue")}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-orange-200">
                        <div
                          className="h-2 rounded-full bg-orange-500"
                          style={{
                            width: t("dashboard.freelancers.focusTimePercent"),
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {t("dashboard.freelancers.projectsActiveValue")}
                        </div>
                        <div className="text-xs text-blue-800">
                          {t("dashboard.freelancers.projectsActive")}
                        </div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3 text-center">
                        <div className="text-lg font-bold text-green-600">
                          {t("dashboard.freelancers.onTimeDeliveryValue")}
                        </div>
                        <div className="text-xs text-green-800">
                          {t("dashboard.freelancers.onTimeDelivery")}
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
                      {t("freelancers.title")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("freelancers.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-orange-900">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      {t("freelancers.timeTracking.title")}
                    </h4>
                    <p className="text-sm leading-relaxed text-orange-800">
                      {t("freelancers.timeTracking.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-orange-900">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      {t("freelancers.healthWellness.title")}
                    </h4>
                    <p className="text-sm leading-relaxed text-orange-800">
                      {t("freelancers.healthWellness.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        <span className="text-sm font-bold">💼</span>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold">
                          {t("freelancers.successStory.title")}
                        </h4>
                        <p className="text-sm text-orange-100 italic">
                          {t("freelancers.successStory.description")}
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
            <h3 className="mb-4 text-3xl font-bold">{t("cta.title")}</h3>
            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col justify-center gap-6 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 rounded-xl px-8 py-3 font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t("cta.startTrial")}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary rounded-xl bg-transparent px-8 py-3 font-semibold shadow-lg transition-all duration-300 hover:text-gray-900 hover:shadow-xl"
              >
                <Play className="mr-2 h-4 w-4" />
                {t("cta.seeDemo")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
