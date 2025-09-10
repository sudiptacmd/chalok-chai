"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  driver: any
}

export function BookingModal({ isOpen, onClose, driver }: BookingModalProps) {
  const [bookingData, setBookingData] = useState({
    bookingType: "daily",
    startDate: "",
    numberOfMonths: 1,
    selectedDates: [] as string[],
    pickupLocation: "",
    notes: "",
  })

  const [currentDate, setCurrentDate] = useState(new Date())
  const [submitting, setSubmitting] = useState(false)

  // Mock availability data - in real app, this would come from props or API
  const driverAvailability: Record<string, "available" | "booked" | "unavailable"> = {
    "2024-01-15": "available",
    "2024-01-16": "available",
    "2024-01-17": "booked",
    "2024-01-18": "available",
    "2024-01-19": "available",
    "2024-01-20": "available",
    "2024-01-21": "booked",
    "2024-01-22": "available",
    "2024-01-23": "available",
    "2024-01-24": "unavailable",
    "2024-01-25": "available",
    "2024-01-26": "available",
    "2024-01-27": "available",
    "2024-01-28": "booked",
    "2024-01-29": "available",
    "2024-01-30": "available",
    "2024-01-31": "available",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    try {
      setSubmitting(true)
      const totalCost = calculateTotal()
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: (driver as any).id || (driver as any)._id,
          bookingType: bookingData.bookingType,
          selectedDates: bookingData.bookingType === "daily" ? bookingData.selectedDates : [],
          startDate: bookingData.bookingType === "monthly" ? bookingData.startDate : undefined,
          numberOfMonths: bookingData.bookingType === "monthly" ? bookingData.numberOfMonths : undefined,
          pickupLocation: bookingData.pickupLocation,
          notes: bookingData.notes,
          totalCost,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to create booking")
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("driver:bookingsUpdated"))
      }
      onClose()
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const calculateTotal = () => {
    if (bookingData.bookingType === "daily") {
      return driver.pricePerDay * bookingData.selectedDates.length
    }
    return driver.pricePerMonth * bookingData.numberOfMonths
  }

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

  const getDateStatus = (dateStr: string) => {
    return driverAvailability[dateStr] || "unavailable"
  }

  const getStatusColor = (status: string, isSelected = false) => {
    if (isSelected) {
      return "bg-primary text-primary-foreground border-primary"
    }

    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 cursor-pointer"
      case "booked":
        return "bg-red-500/20 text-red-700 border-red-500/30 cursor-not-allowed"
      case "unavailable":
        return "bg-gray-500/20 text-gray-700 border-gray-500/30 cursor-not-allowed"
      default:
        return "bg-muted/30 text-muted-foreground border-muted cursor-not-allowed"
    }
  }

  const toggleDateSelection = (dateStr: string) => {
    if (bookingData.bookingType !== "daily") return

    const status = getDateStatus(dateStr)
    if (status !== "available") return

    const isSelected = bookingData.selectedDates.includes(dateStr)
    if (isSelected) {
      setBookingData({
        ...bookingData,
        selectedDates: bookingData.selectedDates.filter((date) => date !== dateStr),
      })
    } else {
      setBookingData({
        ...bookingData,
        selectedDates: [...bookingData.selectedDates, dateStr],
      })
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

  const isFormValid = () => {
    if (bookingData.bookingType === "daily") {
      return bookingData.selectedDates.length > 0 && bookingData.pickupLocation.trim() !== ""
    } else {
      return bookingData.startDate !== "" && bookingData.pickupLocation.trim() !== ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Book {driver.name}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Booking Type</Label>
            <Select
              value={bookingData.bookingType}
              onValueChange={(value) =>
                setBookingData({
                  ...bookingData,
                  bookingType: value,
                  selectedDates: [], // Reset selections when changing type
                  startDate: "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Booking</SelectItem>
                <SelectItem value="monthly">Monthly Booking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Monthly Booking */}
          {bookingData.bookingType === "monthly" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfMonths">Number of Months</Label>
                  <Select
                    value={bookingData.numberOfMonths.toString()}
                    onValueChange={(value) =>
                      setBookingData({ ...bookingData, numberOfMonths: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month} {month === 1 ? "Month" : "Months"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Daily Booking Calendar */}
          {bookingData.bookingType === "daily" && (
            <div className="space-y-4">
              <div>
                <Label>Select Available Dates</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Click on available dates to select them for your booking
                </p>
              </div>

              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button type="button" variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <Button type="button" variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="border rounded-lg p-4">
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
                      return <div key={index} className="p-2" />
                    }

                    const dateStr = formatDate(day)
                    const status = getDateStatus(dateStr)
                    const isSelected = bookingData.selectedDates.includes(dateStr)

                    return (
                      <button
                        key={day}
                        type="button"
                        className={cn(
                          "p-2 text-center text-sm border rounded-lg transition-colors",
                          getStatusColor(status, isSelected),
                        )}
                        onClick={() => toggleDateSelection(dateStr)}
                        disabled={status !== "available"}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500/20 border border-green-500/30 rounded" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500/20 border border-red-500/30 rounded" />
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-500/20 border border-gray-500/30 rounded" />
                    <span>Unavailable</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary rounded" />
                    <span>Selected</span>
                  </div>
                </div>

                {/* Selected Dates Summary */}
                {bookingData.selectedDates.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium mb-2">Selected Dates ({bookingData.selectedDates.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.selectedDates.sort().map((date) => (
                        <span key={date} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          {new Date(date).toLocaleDateString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pickupLocation">Pickup Location</Label>
            <Input
              id="pickupLocation"
              placeholder="Enter pickup address"
              value={bookingData.pickupLocation}
              onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or notes"
              value={bookingData.notes}
              onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Booking Summary */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Booking Summary:</span>
            </div>

            {bookingData.bookingType === "daily" ? (
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Selected Days:</span>
                  <span>{bookingData.selectedDates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per Day:</span>
                  <span>৳{driver.pricePerDay.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>
                    {bookingData.numberOfMonths} {bookingData.numberOfMonths === 1 ? "Month" : "Months"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Price per Month:</span>
                  <span>৳{driver.pricePerMonth.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Cost:</span>
                <span className="text-2xl font-bold">৳{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!isFormValid() || submitting}>
              {submitting ? "Sending..." : "Send Booking Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
