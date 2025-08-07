"use client"

import { EnhancedDriverCard } from "@/components/enhanced-driver-card"

// Mock data - replace with actual API call
const mockDrivers = [
  {
    id: "1",
    name: "Ahmed Rahman",
    photo: "/professional-driver-portrait.png",
    rating: 4.8,
    reviewCount: 127,
    experience: "5+ years",
    location: "Dhaka, Dhanmondi",
    pricePerDay: 1500,
    pricePerMonth: 35000,
    verified: true,
    preferences: ["Non-smoker", "English speaking"],
    bio: "Professional driver with 5+ years of experience. Safe and reliable.",
    availability: {
      "2024-01-15": "available",
      "2024-01-16": "available",
      "2024-01-17": "booked",
      "2024-01-18": "available",
      "2024-01-19": "available",
      "2024-01-20": "available",
      "2024-01-21": "available",
      "2024-01-22": "booked",
      "2024-01-23": "available",
      "2024-01-24": "available",
      "2024-01-25": "booked",
      "2024-01-26": "available",
      "2024-01-27": "available",
      "2024-01-28": "available",
      "2024-01-29": "available",
      "2024-01-30": "unavailable",
      "2024-01-31": "available",
    },
  },
  {
    id: "2",
    name: "Karim Uddin",
    photo: "/professional-driver-portrait.png",
    rating: 4.6,
    reviewCount: 89,
    experience: "3-5 years",
    location: "Dhaka, Gulshan",
    pricePerDay: 1800,
    pricePerMonth: 40000,
    verified: true,
    preferences: ["Pet-friendly", "Non-smoker"],
    bio: "Experienced driver specializing in luxury vehicles.",
    availability: {
      "2024-01-15": "available",
      "2024-01-16": "booked",
      "2024-01-17": "available",
      "2024-01-18": "available",
      "2024-01-19": "unavailable",
      "2024-01-20": "available",
      "2024-01-21": "available",
      "2024-01-22": "booked",
      "2024-01-23": "available",
      "2024-01-24": "available",
      "2024-01-25": "booked",
      "2024-01-26": "available",
      "2024-01-27": "available",
      "2024-01-28": "available",
      "2024-01-29": "available",
      "2024-01-30": "unavailable",
      "2024-01-31": "available",
    },
  },
  {
    id: "3",
    name: "Rashida Begum",
    photo: "/professional-female-driver.png",
    rating: 4.9,
    reviewCount: 156,
    experience: "5+ years",
    location: "Dhaka, Uttara",
    pricePerDay: 1600,
    pricePerMonth: 38000,
    verified: true,
    preferences: ["Female driver", "Non-smoker", "English speaking"],
    bio: "Female professional driver with excellent safety record.",
    availability: {
      "2024-01-15": "booked",
      "2024-01-16": "available",
      "2024-01-17": "available",
      "2024-01-18": "available",
      "2024-01-19": "available",
      "2024-01-20": "booked",
      "2024-01-21": "available",
      "2024-01-22": "available",
      "2024-01-23": "unavailable",
      "2024-01-24": "available",
      "2024-01-25": "available",
      "2024-01-26": "booked",
      "2024-01-27": "available",
      "2024-01-28": "available",
      "2024-01-29": "available",
      "2024-01-30": "unavailable",
      "2024-01-31": "available",
    },
  },
]

interface DriverListProps {
  filters: {
    location: string
    bookingType: "daily" | "monthly"
    numberOfDays: number
    priceRange: number[]
    experience: string
    preferences: string[]
  }
}

export function DriverList({ filters }: DriverListProps) {
  // Filter drivers based on filters (mock implementation)
  const filteredDrivers = mockDrivers.filter((driver) => {
    if (filters.location && !driver.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }

    const price = filters.bookingType === "daily" ? driver.pricePerDay : driver.pricePerMonth
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false
    }

    if (filters.experience && !driver.experience.includes(filters.experience)) {
      return false
    }

    if (filters.preferences.length > 0) {
      const hasPreference = filters.preferences.some((pref) => driver.preferences.includes(pref))
      if (!hasPreference) return false
    }

    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{filteredDrivers.length} drivers found</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDrivers.map((driver) => (
          <EnhancedDriverCard key={driver.id} driver={driver} bookingType={filters.bookingType} />
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No drivers found matching your criteria. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  )
}
