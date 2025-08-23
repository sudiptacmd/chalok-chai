"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, Shield, Calendar, Flag, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

interface Driver {
  id: string
  name: string
  photo: string
  rating: number
  reviewCount: number
  experience: string
  location: string
  pricePerDay: number
  pricePerMonth: number
  verified: boolean
  preferences: string[]
  bio: string
  joinedDate: string
  completedTrips: number
  languages: string[]
}

interface DriverProfileHeaderProps {
  driver: Driver
  onBookNow: () => void
  onReport: () => void
}

export function DriverProfileHeader({ driver, onBookNow, onReport }: DriverProfileHeaderProps) {
  const router = useRouter()
  const onMessage = useCallback(async () => {
    // Ensure or create a conversation with this driver
    try {
      // We need the driver user id; the driver.id is driver document id.
      // The conversation creation accepts otherUserId as driver.userId via API lookup is not here, so
      // we'll call a helper route under /api/drivers/[id] to resolve userId is not available.
      // As a pragmatic approach, the server will accept driverId via body.otherUserId if it's a user id.
      // Here we fetch driver detail again to get populated user id.
      const res = await fetch(`/api/drivers/${driver.id}`)
      if (!res.ok) return
  const d = await res.json()
  const otherUserId = d.userId
      if (!otherUserId) return
      const cr = await fetch('/api/messages/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ otherUserId })})
      if (!cr.ok) return
      const { conversationId } = await cr.json()
      router.push(`/messages/${conversationId}`)
    } catch {}
  }, [driver.id, router])
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Driver Photo and Basic Info */}
          <div className="flex flex-col sm:flex-row gap-4 lg:flex-col lg:items-center">
            <div className="relative">
              <Image
                src={driver.photo || "/placeholder.svg"}
                alt={driver.name}
                width={150}
                height={150}
                className="rounded-lg object-cover"
              />
              {driver.verified && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            <div className="space-y-2 lg:text-center">
              <h1 className="text-2xl font-bold">{driver.name}</h1>
              <div className="flex items-center space-x-1 text-muted-foreground lg:justify-center">
                <MapPin className="h-4 w-4" />
                <span>{driver.location}</span>
              </div>
              <div className="flex items-center space-x-1 lg:justify-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{driver.rating}</span>
                <span className="text-muted-foreground">({driver.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Driver Details */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">{driver.completedTrips}</div>
                <div className="text-sm text-muted-foreground">Completed Trips</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">{driver.experience}</div>
                <div className="text-sm text-muted-foreground">Experience</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">৳{driver.pricePerDay}</div>
                <div className="text-sm text-muted-foreground">Per Day</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{driver.bio}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {driver.languages.map((language) => (
                  <Badge key={language} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {driver.preferences.map((preference) => (
                  <Badge key={preference} variant="secondary">
                    {preference}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 lg:w-48">
            <Button onClick={onBookNow} size="lg" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Book Now
            </Button>
            <Button variant="outline" size="lg" className="w-full bg-transparent" onClick={onMessage}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReport}
              className="w-full bg-transparent text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
