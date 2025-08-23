"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DriverApplications } from "@/components/driver-applications"
import { UserManagement } from "@/components/user-management"
import { PlatformAnalytics } from "@/components/platform-analytics"
import DisputeManagement from "@/components/dispute-management"
import { UserCheck, Users, BarChart3, MessageSquareWarning } from "lucide-react"

export function AdminDashboardTabs() {
  return (
    <Tabs defaultValue="applications" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="applications" className="flex items-center space-x-2">
          <UserCheck className="h-4 w-4" />
          <span>Driver Applications</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>User Management</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </TabsTrigger>
        <TabsTrigger value="disputes" className="flex items-center space-x-2">
          <MessageSquareWarning className="h-4 w-4" />
          <span>Disputes</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="applications" className="mt-6">
        <DriverApplications />
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <UserManagement />
      </TabsContent>

      <TabsContent value="analytics" className="mt-6">
        <PlatformAnalytics />
      </TabsContent>
      <TabsContent value="disputes" className="mt-6">
        <DisputeManagement />
      </TabsContent>
    </Tabs>
  )
}
