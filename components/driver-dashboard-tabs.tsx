"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HireRequests } from "@/components/hire-requests"
import { DriverReviewsTab } from "@/components/driver-reviews-tab"
import { DriverInfo } from "@/components/driver-info"
import { DriverNotifications } from "@/components/driver-notifications"
import { DriverAvailability } from "@/components/driver-availability"
import { Inbox, Star, User, Bell, Calendar, ClipboardList } from "lucide-react"
import { DriverBookings } from "@/components/driver-bookings"

export function DriverDashboardTabs() {
  return (
    <Tabs defaultValue="requests" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="requests" className="flex items-center space-x-1">
          <Inbox className="h-4 w-4" />
          <span className="hidden sm:inline">Requests</span>
        </TabsTrigger>
        <TabsTrigger value="bookings" className="flex items-center space-x-1">
          <ClipboardList className="h-4 w-4" />
          <span className="hidden sm:inline">Bookings</span>
        </TabsTrigger>
        <TabsTrigger value="reviews" className="flex items-center space-x-1">
          <Star className="h-4 w-4" />
          <span className="hidden sm:inline">Reviews</span>
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center space-x-1">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center space-x-1">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="availability" className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Availability</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="requests" className="mt-6">
        <HireRequests />
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <DriverReviewsTab />
      </TabsContent>

      <TabsContent value="bookings" className="mt-6">
        <DriverBookings />
      </TabsContent>

      <TabsContent value="profile" className="mt-6">
        <DriverInfo />
      </TabsContent>

      <TabsContent value="notifications" className="mt-6">
        <DriverNotifications />
      </TabsContent>

      <TabsContent value="availability" className="mt-6">
        <DriverAvailability />
      </TabsContent>
    </Tabs>
  )
}
