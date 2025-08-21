"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export function DriverAvailability() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailability] = useState<Record<string, "available" | "unavailable" | "booked">>({})

  // Fetch availability from API on mount
  useEffect(() => {
    fetch("/api/driver/availability")
      .then((res) => res.json())
      .then((data) => {
        if (data.availability) {
          // Convert array to record
          const availObj: Record<string, "available" | "unavailable" | "booked"> = {};
          data.availability.forEach((item: { date: string; status: "unavailable" | "booked" }) => {
            availObj[item.date] = item.status;
          });
          setAvailability(availObj);
        }
      });
  }, []);

  const [isAutoAccept, setIsAutoAccept] = useState(false)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const formatDate = (day: number) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return new Date(year, month, day).toISOString().split("T")[0]
  }

  // Use border color only, not background
  const getStatusBorder = (status: string) => {
    switch (status) {
      case "unavailable":
        return "border-2 border-red-500 text-red-700 bg-white hover:border-red-600";
      case "booked":
        return "border-2 border-blue-500 text-blue-700 bg-white cursor-not-allowed";
      case "available":
      default:
        return "border-2 border-green-500 text-green-700 bg-white hover:border-green-600";
    }
  }

  const toggleAvailability = (dateStr: string) => {
    const currentStatus = availability[dateStr] || "available";
    if (currentStatus === "booked") return; // Can't change booked days

    // Toggle unavailable/available for multiple days
    const updatedAvailability = { ...availability };
    if (currentStatus === "available") {
      updatedAvailability[dateStr] = "unavailable";
    } else if (currentStatus === "unavailable") {
      delete updatedAvailability[dateStr];
    }
    
    // Get only unavailable dates (not booked)
    const unavailableDates = Object.keys(updatedAvailability).filter(date => updatedAvailability[date] === "unavailable");
    
    // Send all unavailable dates to API
    fetch("/api/driver/availability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates: unavailableDates, status: "unavailable" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.availability) {
          const availObj: Record<string, "available" | "unavailable" | "booked"> = {};
          data.availability.forEach((item: { date: string; status: "unavailable" | "booked" }) => {
            availObj[item.date] = item.status;
          });
          setAvailability(availObj);
        }
      });
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Availability Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-accept">Auto-accept bookings</Label>
              <p className="text-sm text-muted-foreground">Automatically accept booking requests for available days</p>
            </div>
            <Switch id="auto-accept" checked={isAutoAccept} onCheckedChange={setIsAutoAccept} />
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Manage Availability</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-2" />;
              }
              const dateStr = formatDate(day);
              const status = availability[dateStr] || "available";
              return (
                <Button
                  key={dateStr}
                  variant="outline"
                  size="sm"
                  className={cn("h-12 text-sm transition-colors bg-white", getStatusBorder(status))}
                  onClick={() => toggleAvailability(dateStr)}
                  disabled={status === "booked"}
                >
                  {day}
                </Button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>Unavailable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span>Booked</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Click on any available or unavailable day to toggle your availability. Booked days
              cannot be changed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
