"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, MessageCircle } from "lucide-react"

// Mock booking data
const mockBookings = [
  {
    id: "1",
    driverName: "Ahmed Rahman",
    driverPhoto: "/professional-driver-portrait.png",
    bookingType: "daily",
    startDate: "2024-01-15",
    endDate: "2024-01-17",
    status: "completed",
    totalCost: 4500,
    pickupLocation: "Dhanmondi, Dhaka",
    rating: 5,
  },
  {
    id: "2",
    driverName: "Karim Uddin",
    driverPhoto: "/professional-driver-portrait.png",
    bookingType: "monthly",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    status: "active",
    totalCost: 40000,
    pickupLocation: "Gulshan, Dhaka",
    rating: null,
  },
  {
    id: "3",
    driverName: "Rashida Begum",
    driverPhoto: "/professional-female-driver.png",
    bookingType: "daily",
    startDate: "2024-01-10",
    endDate: "2024-01-12",
    status: "cancelled",
    totalCost: 4800,
    pickupLocation: "Uttara, Dhaka",
    rating: null,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500/20 text-green-700"
    case "active":
      return "bg-blue-500/20 text-blue-700"
    case "cancelled":
      return "bg-red-500/20 text-red-700"
    case "pending":
      return "bg-yellow-500/20 text-yellow-700"
    default:
      return "bg-gray-500/20 text-gray-700"
  }
}

export function BookingHistory() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{booking.driverName}</h3>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.pickupLocation}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <div className="font-medium capitalize">{booking.bookingType}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="font-medium">
                      {new Date(booking.startDate).toLocaleDateString()} -{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Cost:</span>
                    <div className="font-medium">৳{booking.totalCost.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="font-medium">
                      {booking.rating ? (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{booking.rating}</span>
                        </div>
                      ) : (
                        "Not rated"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {booking.status === "completed" && !booking.rating && (
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Star className="h-4 w-4 mr-2" />
                      Rate Driver
                    </Button>
                  )}
                  {booking.status === "active" && (
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Driver
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="bg-transparent">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
