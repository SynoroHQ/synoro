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
    description: "User banned for violation of terms",
    timestamp: "3 hours ago",
    status: "error" as const,
  },
];

const getStatusIcon = (status: "success" | "warning" | "error") => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
};

const getStatusColor = (status: "success" | "warning" | "error") => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "error":
      return "bg-red-100 text-red-800";
  }
};

export default function AuthOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Authentication & Authorization</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and security settings for your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <SectionGroup>
        <Section>
          <SectionHeader>
            <SectionTitle>Overview</SectionTitle>
            <SectionDescription>
              Key metrics and statistics for your authentication system.
            </SectionDescription>
          </SectionHeader>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${
                      stat.changeType === "positive" ? "text-green-600" :
                      stat.changeType === "negative" ? "text-red-600" : "text-gray-600"
                    }`}>
                      {stat.change}
                    </span>
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <Link href={stat.href} className="text-xs text-blue-600 hover:underline">
                    View details →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* Recent Activity */}
        <Section>
          <SectionHeader>
            <SectionTitle>Recent Activity</SectionTitle>
            <SectionDescription>
              Latest authentication and authorization events.
            </SectionDescription>
          </SectionHeader>
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Monitor user actions and system events in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(activity.status)}
                      <div>
                        <p className="text-sm font-medium">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  View Full Activity Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Quick Actions */}
        <Section>
          <SectionHeader>
            <SectionTitle>Quick Actions</SectionTitle>
            <SectionDescription>
              Common tasks and shortcuts for managing authentication.
            </SectionDescription>
          </SectionHeader>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Add User</span>
                </CardTitle>
                <CardDescription>
                  Create a new user account with appropriate permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Create User</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Manage Roles</span>
                </CardTitle>
                <CardDescription>
                  Configure user roles and permission sets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Roles</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>API Keys</span>
                </CardTitle>
                <CardDescription>
                  Generate and manage API access keys.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Manage Keys</Button>
              </CardContent>
            </Card>
          </div>
        </Section>
      </SectionGroup>
    </div>
  );
}
