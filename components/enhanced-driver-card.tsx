"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Shield, Calendar } from "lucide-react";
import { EnhancedBookingModal } from "@/components/enhanced-booking-modal";

interface Driver {
  id: string;
  name: string;
  photo: string | null;
  rating: number;
  reviewCount: number;
  experience: string;
  location: string;
  pricePerDay: number;
  pricePerMonth: number;
  verified: boolean;
  preferences: string[];
  bio: string;
  availability: Record<string, "available" | "booked" | "unavailable">;
}

interface EnhancedDriverCardProps {
  driver: Driver;
  bookingType: "daily" | "monthly";
}

export function EnhancedDriverCard({
  driver,
  bookingType,
}: EnhancedDriverCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const price =
    bookingType === "daily" ? driver.pricePerDay : driver.pricePerMonth;
  const priceLabel = bookingType === "daily" ? "per day" : "per month";

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Driver Photo */}
            <div className="flex-shrink-0">
              <div className="relative">
                {driver.photo ? (
                  <>
                    <Image
                      src={driver.photo}
                      alt={driver.name}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                      onError={(e) => {
                        // Hide the image and show fallback if error
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.nextElementSibling) {
                          (
                            e.currentTarget.nextElementSibling as HTMLElement
                          ).style.display = "flex";
                        }
                      }}
                    />
                    {/* Fallback avatar for broken images */}
                    <div
                      className="w-[100px] h-[100px] rounded-lg bg-muted flex items-center justify-center text-2xl font-semibold text-muted-foreground"
                      style={{ display: "none" }}
                    >
                      {driver.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  </>
                ) : (
                  /* Default avatar when no photo */
                  <div className="w-[100px] h-[100px] rounded-lg bg-muted flex items-center justify-center text-2xl font-semibold text-muted-foreground">
                    {driver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                {driver.verified && (
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Driver Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{driver.name}</h3>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{driver.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ৳{price.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {priceLabel}
                  </div>
                </div>
              </div>

              {/* Rating and Experience */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{driver.rating}</span>
                  <span className="text-muted-foreground">
                    ({driver.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{driver.experience} experience</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {driver.bio}
              </p>

              {/* Preferences */}
              <div className="flex flex-wrap gap-2">
                {driver.preferences.slice(0, 3).map((preference) => (
                  <Badge
                    key={preference}
                    variant="secondary"
                    className="text-xs"
                  >
                    {preference}
                  </Badge>
                ))}
                {driver.preferences.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{driver.preferences.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Link href={`/driver/${driver.id}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    View Profile
                  </Button>
                </Link>
                <Button
                  className="flex-1"
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EnhancedBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        driver={driver}
        defaultBookingType={bookingType}
      />
    </>
  );
}
