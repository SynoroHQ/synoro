import Link from "next/link";
import {
  Section,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Key,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "42",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    href: "/dashboard/auth/users",
  },
  {
    title: "Active Sessions",
    value: "28",
    change: "+5%",
    changeType: "positive" as const,
    icon: Activity,
    href: "/dashboard/auth",
  },
  {
    title: "System Roles",
    value: "5",
    change: "0%",
    changeType: "neutral" as const,
    icon: Shield,
    href: "/dashboard/auth/roles",
  },
  {
    title: "API Keys",
    value: "8",
    change: "+2",
    changeType: "positive" as const,
    icon: Key,
    href: "/dashboard/auth/api-keys",
  },
];

const recentActivity = [
  {
    id: "1",
    type: "user_login",
    user: "admin@example.com",
    description: "User logged in successfully",
    timestamp: "2 minutes ago",
    status: "success" as const,
  },
  {
    id: "2",
    type: "role_created",
    user: "moderator@example.com",
    description: "New role 'Content Editor' created",
    timestamp: "15 minutes ago",
    status: "success" as const,
  },
  {
    id: "3",
    type: "api_key_generated",
    user: "dev@example.com",
    description: "New API key generated for development",
    timestamp: "1 hour ago",
    status: "success" as const,
  },
  {
    id: "4",
    type: "failed_login",
    user: "unknown@example.com",
    description: "Failed login attempt from suspicious IP",
    timestamp: "2 hours ago",
    status: "warning" as const,
  },
  {
    id: "5",
    type: "user_banned",
    user: "spam@example.com",
    description: "User account banned for violations",
    timestamp: "3 hours ago",
    status: "error" as const,
  },
];

const securityAlerts = [
  {
    id: "1",
    type: "high",
    title: "Multiple failed login attempts",
    description: "Detected 15 failed login attempts from IP 192.168.1.100",
    timestamp: "1 hour ago",
  },
  {
    id: "2",
    type: "medium",
    title: "API key expired",
    description: "Production API key will expire in 7 days",
    timestamp: "3 hours ago",
  },
  {
    id: "3",
    type: "low",
    title: "New user registration",
    description: "New user registered from new location",
    timestamp: "5 hours ago",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getAlertColor = (type: string) => {
  switch (type) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
};

export default function AuthOverviewPage() {
  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>Authentication Overview</SectionTitle>
          <SectionDescription>
            Monitor authentication and authorization activity across your
            system.
          </SectionDescription>
        </SectionHeader>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link href={stat.href} key={stat.title}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        stat.changeType === "positive" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      from last month
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section>
          <SectionHeader>
            <SectionTitle>Recent Activity</SectionTitle>
            <SectionDescription>
              Latest authentication and authorization events.
            </SectionDescription>
          </SectionHeader>

          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-3 rounded-lg border p-3"
              >
                {getStatusIcon(activity.status)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-muted-foreground text-xs">
                    {activity.user} • {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button variant="outline" size="sm" className="w-full">
              View All Activity
            </Button>
          </div>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Security Alerts</SectionTitle>
            <SectionDescription>
              Important security notifications and warnings.
            </SectionDescription>
          </SectionHeader>

          <div className="space-y-3">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center space-x-2">
                      <Badge variant={getAlertColor(alert.type) as any}>
                        {alert.type.toUpperCase()}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {alert.timestamp}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium">{alert.title}</h4>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {alert.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button variant="outline" size="sm" className="w-full">
              View All Alerts
            </Button>
          </div>
        </Section>
      </div>

      <Section>
        <SectionHeader>
          <SectionTitle>Quick Actions</SectionTitle>
          <SectionDescription>
            Common authentication and authorization tasks.
          </SectionDescription>
        </SectionHeader>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/auth/users">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5" />
                  Manage Users
                </CardTitle>
                <CardDescription>
                  Add, edit, or remove user accounts
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/auth/roles">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5" />
                  Configure Roles
                </CardTitle>
                <CardDescription>
                  Set up user roles and permissions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/auth/api-keys">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Generate and manage API access keys
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </Section>
    </SectionGroup>
  );
}
