"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@/components/user-profile"
import { BookingHistory } from "@/components/booking-history"
import { User, History } from "lucide-react"

export function UserDashboardTabs() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>Profile</span>
        </TabsTrigger>
        <TabsTrigger value="bookings" className="flex items-center space-x-2">
          <History className="h-4 w-4" />
          <span>Booking History</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <UserProfile />
      </TabsContent>

      <TabsContent value="bookings" className="mt-6">
        <BookingHistory />
      </TabsContent>
    </Tabs>
  )
}
