import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Car,
  CheckCircle,
  Clock,
  Home,
  Play,
  Sparkles,
  Sprout,
  Target,
  User,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function WhoBenefits() {
  const t = useTranslations("WhoBenefits");
  return (
    <section id="for-whom" className="section section-gradient">
      <div className="container-default">
        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
          <Badge className="bg-primary/10 text-primary border-primary/30 mb-4 rounded-full px-4 py-2 text-xs font-medium sm:mb-6 sm:px-6 sm:py-3 sm:text-sm">
            <Users className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            {t("badge")}
          </Badge>
          <h2 className="heading-title mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl xl:text-6xl">
            {t("title")}
          </h2>
          <p className="heading-subtitle text-muted-foreground mx-auto max-w-3xl px-2 text-base leading-relaxed sm:px-0 sm:text-lg lg:text-xl">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-16 sm:space-y-20 lg:space-y-24">
          {/* Families Section */}
          <div className="group">
            <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-none sm:h-16 sm:w-16">
                    <Users className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-2xl font-bold text-blue-600 sm:mb-2 sm:text-3xl">
                      {t("families.title")}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {t("families.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-blue-600 sm:h-5 sm:w-5" />
                      {t("families.expenseTracking.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-blue-800 sm:text-sm">
                      {t("families.expenseTracking.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-blue-600 sm:h-5 sm:w-5" />
                      {t("families.choreManagement.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-blue-800 sm:text-sm">
                      {t("families.choreManagement.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-blue-600 sm:h-5 sm:w-5" />
                      {t("families.smartSavings.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-blue-800 sm:text-sm">
                      {t("families.smartSavings.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white sm:p-6">
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
                  <div className="relative rounded-3xl border border-blue-100 bg-white p-8 shadow-none">
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
            <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-500/20 to-purple-600/20 blur-xl"></div>
                <div className="relative rounded-3xl border border-purple-100 bg-white p-8 shadow-none">
                  <div className="space-y-4">
                    <div className="mb-6 text-center">
                      <Car className="mx-auto mb-3 h-12 w-12 text-purple-600" />
                      <h4 className="font-bold text-purple-900">
                        {t("dashboard.carOwners.vehicleMaintenanceTracker")}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3">
                        <CheckCircle className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
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
                <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-none sm:h-16 sm:w-16">
                    <Car className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-2xl font-bold text-purple-600 sm:mb-2 sm:text-3xl">
                      {t("carOwners.title")}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {t("carOwners.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
                      {t("carOwners.predictiveMaintenance.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-purple-800 sm:text-sm">
                      {t("carOwners.predictiveMaintenance.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
                      {t("carOwners.costOptimization.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-purple-800 sm:text-sm">
                      {t("carOwners.costOptimization.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white sm:p-6">
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
            <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-none sm:h-16 sm:w-16">
                    <Home className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-2xl font-bold text-teal-600 sm:mb-2 sm:text-3xl">
                      {t("homeowners.title")}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {t("homeowners.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 text-teal-600 sm:h-5 sm:w-5" />
                      {t("homeowners.maintenanceScheduling.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-teal-800 sm:text-sm">
                      {t("homeowners.maintenanceScheduling.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 text-teal-600 sm:h-5 sm:w-5" />
                      {t("homeowners.seasonalReminders.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-teal-800 sm:text-sm">
                      {t("homeowners.seasonalReminders.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white sm:p-6">
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
                  <div className="relative rounded-3xl border border-teal-100 bg-white p-8 shadow-none">
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
            <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 blur-xl"></div>
                <div className="relative rounded-3xl border border-orange-100 bg-white p-8 shadow-none">
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
                <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-none sm:h-16 sm:w-16">
                    <User className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-2xl font-bold text-orange-600 sm:mb-2 sm:text-3xl">
                      {t("freelancers.title")}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {t("freelancers.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 text-orange-600 sm:h-5 sm:w-5" />
                      {t("freelancers.timeTracking.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-orange-800 sm:text-sm">
                      {t("freelancers.timeTracking.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 text-orange-600 sm:h-5 sm:w-5" />
                      {t("freelancers.healthWellness.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-orange-800 sm:text-sm">
                      {t("freelancers.healthWellness.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white sm:p-6">
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

          {/* Gardeners Section */}
          <div className="group">
            <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-green-500 to-green-600 shadow-none sm:h-16 sm:w-16">
                    <Sprout className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-2xl font-bold text-green-600 sm:mb-2 sm:text-3xl">
                      {t("gardeners.title")}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {t("gardeners.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="rounded-2xl border border-green-100 bg-green-50 p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 sm:h-5 sm:w-5" />
                      {t("gardeners.seasonalPlanning.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-green-800 sm:text-sm">
                      {t("gardeners.seasonalPlanning.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-green-100 bg-green-50 p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 sm:h-5 sm:w-5" />
                      {t("gardeners.plantCare.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-green-800 sm:text-sm">
                      {t("gardeners.plantCare.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-green-100 bg-green-50 p-4 sm:p-6">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-900 sm:mb-3 sm:text-base">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 sm:h-5 sm:w-5" />
                      {t("gardeners.weatherSmart.title")}
                    </h4>
                    <p className="text-xs leading-relaxed text-green-800 sm:text-sm">
                      {t("gardeners.weatherSmart.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-green-500 to-green-600 p-4 text-white sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        <span className="text-sm font-bold">🌱</span>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold">
                          {t("gardeners.successStory.title")}
                        </h4>
                        <p className="text-sm text-green-100 italic">
                          {t("gardeners.successStory.description")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-green-500/20 to-green-600/20 blur-xl"></div>
                  <div className="relative rounded-3xl border border-green-100 bg-white p-8 shadow-none">
                    <div className="mb-6 text-center">
                      <Sprout className="mx-auto mb-3 h-12 w-12 text-green-600" />
                      <h4 className="font-bold text-green-900">
                        {t("dashboard.gardeners.gardenDashboard")}
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-green-50 p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {t("dashboard.gardeners.plantsActiveValue")}
                          </div>
                          <div className="text-xs text-green-800">
                            {t("dashboard.gardeners.plantsActive")}
                          </div>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {t("dashboard.gardeners.wateringScheduleValue")}
                          </div>
                          <div className="text-xs text-blue-800">
                            {t("dashboard.gardeners.wateringSchedule")}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-yellow-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-900">
                            {t("dashboard.gardeners.harvestForecast")}
                          </span>
                        </div>
                        <div className="text-xs text-yellow-800">
                          {t("dashboard.gardeners.harvestForecastValue")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center sm:mt-20">
          <div className="from-primary/10 to-accent/10 border-primary/20 rounded-3xl border bg-gradient-to-r p-6 sm:p-8 lg:p-12">
            <h3 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl">
              {t("cta.title")}
            </h3>
            <p className="text-muted-foreground mx-auto mb-6 max-w-2xl px-2 text-sm sm:mb-8 sm:px-0 sm:text-base">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground w-full rounded-xl px-6 py-3 font-semibold shadow-none sm:w-auto sm:px-8"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t("cta.startBeta")}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary w-full rounded-xl bg-transparent px-6 py-3 font-semibold shadow-none sm:w-auto sm:px-8"
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
