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

interface EnhancedBookingModalProps {
  isOpen: boolean
  onClose: () => void
  driver: any
  defaultBookingType?: "daily" | "monthly"
}

export function EnhancedBookingModal({
  isOpen,
  onClose,
  driver,
  defaultBookingType = "daily",
}: EnhancedBookingModalProps) {
  const [bookingData, setBookingData] = useState({
    bookingType: defaultBookingType,
    startDate: "",
    numberOfMonths: 1,
    selectedDates: [] as string[],
    pickupLocation: "",
    notes: "",
  })

  const [currentDate, setCurrentDate] = useState(new Date())

  // Enhanced availability data with more realistic patterns
  const driverAvailability = driver.availability || {
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
    "2024-02-01": "available",
    "2024-02-02": "available",
    "2024-02-03": "booked",
    "2024-02-04": "available",
    "2024-02-05": "available",
    "2024-02-06": "available",
    "2024-02-07": "unavailable",
    "2024-02-08": "available",
    "2024-02-09": "available",
    "2024-02-10": "available",
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle booking submission
    console.log("Enhanced booking submitted:", bookingData)
    onClose()
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
    // Don't allow booking past dates
    const today = new Date()
    const dateToCheck = new Date(dateStr)
    if (dateToCheck < today) {
      return "unavailable"
    }
    return driverAvailability[dateStr] || "unavailable"
  }

  const getStatusColor = (status: string, isSelected = false) => {
    if (isSelected) {
      return "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20"
    }

    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 cursor-pointer transition-colors"
      case "booked":
        return "bg-red-500/20 text-red-700 border-red-500/30 cursor-not-allowed opacity-60"
      case "unavailable":
        return "bg-gray-500/20 text-gray-700 border-gray-500/30 cursor-not-allowed opacity-60"
      default:
        return "bg-muted/30 text-muted-foreground border-muted cursor-not-allowed opacity-60"
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
        selectedDates: [...bookingData.selectedDates, dateStr].sort(),
      })
    }
  }

  const clearAllSelections = () => {
    setBookingData({
      ...bookingData,
      selectedDates: [],
    })
  }

  const selectAllAvailableInMonth = () => {
    const days = getDaysInMonth(currentDate)
    const availableDates = days
      .filter((day) => day !== null)
      .map((day) => formatDate(day!))
      .filter((dateStr) => getDateStatus(dateStr) === "available")

    setBookingData({
      ...bookingData,
      selectedDates: [...new Set([...bookingData.selectedDates, ...availableDates])].sort(),
    })
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

  const getAvailableCount = () => {
    return days
      .filter((day) => day !== null)
      .map((day) => formatDate(day!))
      .filter((dateStr) => getDateStatus(dateStr) === "available").length
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
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
                  bookingType: value as "daily" | "monthly",
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
                    min={new Date().toISOString().split("T")[0]}
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

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Monthly Booking:</strong> You'll have access to the driver for the entire duration. Specific
                  daily availability will be coordinated directly with the driver.
                </p>
              </div>
            </div>
          )}

          {/* Daily Booking Calendar */}
          {bookingData.bookingType === "daily" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Select Available Dates</Label>
                  <p className="text-sm text-muted-foreground">
                    Click on available dates to select them for your booking
                  </p>
                </div>
                <div className="flex gap-2">
                  {bookingData.selectedDates.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAllSelections}
                      className="bg-transparent"
                    >
                      Clear All
                    </Button>
                  )}
                  {getAvailableCount() > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllAvailableInMonth}
                      className="bg-transparent"
                    >
                      Select All Available
                    </Button>
                  )}
                </div>
              </div>

              {/* Calendar Navigation */}
              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <span className="font-medium text-lg">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <p className="text-sm text-muted-foreground">{getAvailableCount()} days available</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="border rounded-lg p-4 bg-muted/20">
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
                          "p-3 text-center text-sm border rounded-lg transition-all duration-200 font-medium",
                          getStatusColor(status, isSelected),
                        )}
                        onClick={() => toggleDateSelection(dateStr)}
                        disabled={status !== "available"}
                        title={
                          status === "available"
                            ? "Click to select this date"
                            : status === "booked"
                              ? "Already booked"
                              : "Not available"
                        }
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="flex flex-wrap gap-4 mt-6 text-sm">
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
                  <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Selected Dates ({bookingData.selectedDates.length})</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAllSelections}
                        className="h-auto p-1 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                      {bookingData.selectedDates.map((date) => (
                        <span
                          key={date}
                          className="text-xs bg-primary/20 text-primary px-2 py-1 rounded cursor-pointer hover:bg-primary/30 transition-colors"
                          onClick={() => toggleDateSelection(date)}
                          title="Click to remove"
                        >
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

          {/* Enhanced Booking Summary */}
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-lg">Booking Summary</span>
              <div className="text-right">
                <div className="text-2xl font-bold">৳{calculateTotal().toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </div>
            </div>

            {bookingData.bookingType === "daily" ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Selected Days:</span>
                  <span className="font-medium">{bookingData.selectedDates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per Day:</span>
                  <span className="font-medium">৳{driver.pricePerDay.toLocaleString()}</span>
                </div>
                {bookingData.selectedDates.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-base font-medium">
                      <span>Subtotal:</span>
                      <span>৳{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">
                    {bookingData.numberOfMonths} {bookingData.numberOfMonths === 1 ? "Month" : "Months"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Price per Month:</span>
                  <span className="font-medium">৳{driver.pricePerMonth.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-base font-medium">
                    <span>Subtotal:</span>
                    <span>৳{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!isFormValid()}>
              {bookingData.bookingType === "daily" && bookingData.selectedDates.length === 0
                ? "Select dates to continue"
                : "Send Booking Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
