"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DriverAvailabilityCalendarProps {
  availability: Record<string, "available" | "unavailable" | "booked">
  onToggleAvailability: (dateStr: string) => void
}

export function DriverAvailabilityCalendar({ 
  availability, 
  onToggleAvailability 
}: DriverAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500 text-white border-green-500 hover:bg-green-600"
      case "unavailable":
        return "bg-red-500 text-white border-red-500 hover:bg-red-600"
      case "booked":
        return "bg-blue-500 text-white border-blue-500 cursor-not-allowed"
      default:
        return "bg-muted text-muted-foreground border-muted hover:bg-muted/80"
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
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

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="p-2" />
          }

          const dateStr = formatDate(day)
          const status = availability[dateStr] || "unavailable"

          return (
            <Button
              key={day}
              variant="outline"
              size="sm"
              className={cn("h-12 text-sm transition-colors", getStatusColor(status))}
              onClick={() => onToggleAvailability(dateStr)}
              disabled={status === "booked"}
            >
              {day}
            </Button>
          )
        })}
      </div>

      {/* Legend */}
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
    </div>
  )
}
