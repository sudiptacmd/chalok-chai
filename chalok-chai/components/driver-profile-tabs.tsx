"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DriverCalendar } from "@/components/driver-calendar"
import { DriverReviews } from "@/components/driver-reviews"

interface DriverProfileTabsProps {
  driver: any
}

export function DriverProfileTabs({ driver }: DriverProfileTabsProps) {
  return (
    <Tabs defaultValue="calendar" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calendar">Availability</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent value="calendar" className="mt-6">
        <DriverCalendar availability={driver.availability} />
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <DriverReviews reviews={driver.reviews} />
      </TabsContent>
    </Tabs>
  )
}
