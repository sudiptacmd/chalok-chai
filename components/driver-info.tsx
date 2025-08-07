"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Upload, Shield } from "lucide-react"

export function DriverInfo() {
  const [isEditing, setIsEditing] = useState(false)
  const [driverData, setDriverData] = useState({
    name: "Ahmed Rahman",
    email: "ahmed.rahman@example.com",
    phone: "+880 1234-567890",
    dateOfBirth: "1985-03-15",
    nationalId: "1234567890123",
    drivingLicense: "DL123456789",
    location: "Dhaka, Dhanmondi",
    bio: "Professional driver with 5+ years of experience. Safe and reliable driving with excellent knowledge of Dhaka roads.",
    experience: "5+ years",
    pricePerDay: 1500,
    pricePerMonth: 35000,
    languages: ["Bengali", "English"],
    preferences: ["Non-smoker", "English speaking", "Pet-friendly"],
    verified: true,
  })

  const handleSave = () => {
    // Handle profile update
    console.log("Driver profile updated:", driverData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form data
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Driver Profile</CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-lg">
                  {driverData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {driverData.verified && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{driverData.name}</h2>
              <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                Verified Driver
              </Badge>
              {isEditing && (
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={driverData.name}
                  onChange={(e) => setDriverData({ ...driverData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={driverData.email}
                  onChange={(e) => setDriverData({ ...driverData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={driverData.phone}
                  onChange={(e) => setDriverData({ ...driverData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={driverData.dateOfBirth}
                  onChange={(e) => setDriverData({ ...driverData, dateOfBirth: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={driverData.location}
                  onChange={(e) => setDriverData({ ...driverData, location: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input
                  id="nationalId"
                  value={driverData.nationalId}
                  onChange={(e) => setDriverData({ ...driverData, nationalId: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drivingLicense">Driving License</Label>
                <Input
                  id="drivingLicense"
                  value={driverData.drivingLicense}
                  onChange={(e) => setDriverData({ ...driverData, drivingLicense: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={driverData.experience}
                  onChange={(e) => setDriverData({ ...driverData, experience: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerDay">Price per Day (৳)</Label>
                  <Input
                    id="pricePerDay"
                    type="number"
                    value={driverData.pricePerDay}
                    onChange={(e) =>
                      setDriverData({ ...driverData, pricePerDay: Number.parseInt(e.target.value) || 0 })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerMonth">Price per Month (৳)</Label>
                  <Input
                    id="pricePerMonth"
                    type="number"
                    value={driverData.pricePerMonth}
                    onChange={(e) =>
                      setDriverData({ ...driverData, pricePerMonth: Number.parseInt(e.target.value) || 0 })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={driverData.bio}
                onChange={(e) => setDriverData({ ...driverData, bio: e.target.value })}
                disabled={!isEditing}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-2">
                {driverData.languages.map((language) => (
                  <Badge key={language} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferences</Label>
              <div className="flex flex-wrap gap-2">
                {driverData.preferences.map((preference) => (
                  <Badge key={preference} variant="secondary">
                    {preference}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
