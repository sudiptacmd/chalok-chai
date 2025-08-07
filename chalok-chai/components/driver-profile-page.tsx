"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { DriverProfileHeader } from "@/components/driver-profile-header"
import { DriverProfileTabs } from "@/components/driver-profile-tabs"
import { BookingModal } from "@/components/booking-modal"
import { ReportModal } from "@/components/report-modal"

interface DriverProfilePageProps {
  driverId: string
}

// Mock driver data - replace with API call
const mockDriver = {
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
  preferences: ["Non-smoker", "English speaking", "Pet-friendly"],
  bio: "Professional driver with 5+ years of experience. Safe and reliable driving with excellent knowledge of Dhaka roads. Available for both daily and monthly bookings.",
  joinedDate: "2022-03-15",
  completedTrips: 234,
  languages: ["Bengali", "English"],
  vehicleTypes: ["Sedan", "SUV", "Hatchback"],
  availability: {
    "2024-01-15": "available",
    "2024-01-16": "available",
    "2024-01-17": "booked",
    "2024-01-18": "available",
    "2024-01-19": "available",
    "2024-01-20": "available",
    "2024-01-21": "booked",
  },
  reviews: [
    {
      id: "1",
      userName: "Sarah Ahmed",
      rating: 5,
      comment: "Excellent driver! Very professional and punctual.",
      date: "2024-01-10",
    },
    {
      id: "2",
      userName: "Karim Hassan",
      rating: 4,
      comment: "Good driving skills and friendly nature.",
      date: "2024-01-08",
    },
  ],
}

export function DriverProfilePage({ driverId }: DriverProfilePageProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DriverProfileHeader
          driver={mockDriver}
          onBookNow={() => setIsBookingModalOpen(true)}
          onReport={() => setIsReportModalOpen(true)}
        />
        <DriverProfileTabs driver={mockDriver} />
      </main>

      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} driver={mockDriver} />

      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} driverId={driverId} />
    </div>
  )
}
