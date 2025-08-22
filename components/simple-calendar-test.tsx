"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export function SimpleCalendarTest() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Simple Calendar Test</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This is a simple calendar test component.
          </p>
          
          <div className="grid grid-cols-7 gap-2 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 6 // Start from previous month
              const date = new Date()
              date.setDate(day)
              
              return (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDateSelect(date)}
                >
                  {day > 0 && day <= 31 ? day : ""}
                </Button>
              )
            })}
          </div>

          {selectedDate && (
            <p className="text-sm text-center">
              Selected: {selectedDate.toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
