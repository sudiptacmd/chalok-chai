"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Car, DollarSign, TrendingUp, Calendar, Star } from "lucide-react"

// Mock analytics data
const analyticsData = {
  totalUsers: 1247,
  totalDrivers: 342,
  totalCarOwners: 905,
  activeBookings: 89,
  completedBookings: 2156,
  totalRevenue: 1250000,
  averageRating: 4.7,
  monthlyGrowth: 12.5,
  recentBookings: [
    {
      id: "1",
      driverName: "Ahmed Rahman",
      clientName: "Sarah Ahmed",
      amount: 4500,
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      driverName: "Rashida Begum",
      clientName: "Karim Hassan",
      amount: 35000,
      date: "2024-01-14",
      status: "active",
    },
    {
      id: "3",
      driverName: "Fatima Khan",
      clientName: "Ahmed Ali",
      amount: 1800,
      date: "2024-01-14",
      status: "completed",
    },
  ],
}

export function PlatformAnalytics() {
  const stats = [
    {
      title: "Total Users",
      value: analyticsData.totalUsers.toLocaleString(),
      icon: Users,
      change: "+8.2%",
      changeType: "positive",
    },
    {
      title: "Active Drivers",
      value: analyticsData.totalDrivers.toLocaleString(),
      icon: Car,
      change: "+12.1%",
      changeType: "positive",
    },
    {
      title: "Total Revenue",
      value: `৳${(analyticsData.totalRevenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      change: "+15.3%",
      changeType: "positive",
    },
    {
      title: "Average Rating",
      value: analyticsData.averageRating.toString(),
      icon: Star,
      change: "+0.2",
      changeType: "positive",
    },
    {
      title: "Active Bookings",
      value: analyticsData.activeBookings.toString(),
      icon: Calendar,
      change: "+5.7%",
      changeType: "positive",
    },
    {
      title: "Monthly Growth",
      value: `${analyticsData.monthlyGrowth}%`,
      icon: TrendingUp,
      change: "+2.1%",
      changeType: "positive",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-xs ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{booking.driverName}</p>
                    <p className="text-sm text-muted-foreground">with {booking.clientName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(booking.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">৳{booking.amount.toLocaleString()}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === "completed"
                          ? "bg-green-500/20 text-green-700"
                          : "bg-blue-500/20 text-blue-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Car Owners</span>
                <span className="font-semibold">{analyticsData.totalCarOwners}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Verified Drivers</span>
                <span className="font-semibold">{analyticsData.totalDrivers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Completed Bookings</span>
                <span className="font-semibold">{analyticsData.completedBookings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Success Rate</span>
                <span className="font-semibold">96.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Booking Value</span>
                <span className="font-semibold">
                  ৳{Math.round(analyticsData.totalRevenue / analyticsData.completedBookings).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
