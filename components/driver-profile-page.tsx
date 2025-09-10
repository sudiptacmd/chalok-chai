"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { DriverProfileHeader } from "@/components/driver-profile-header";
import { DriverProfileTabs } from "@/components/driver-profile-tabs";
import { EnhancedBookingModal } from "@/components/enhanced-booking-modal";
import { ReportModal } from "@/components/report-modal";

interface DriverProfilePageProps {
  driverId: string;
}

interface DriverData {
  id: string;
  name: string;
  photo: string | null;
  rating: number;
  reviewCount: number;
  experience: string;
  location: string;
  pricePerDay: number | null;
  pricePerMonth: number | null;
  verified: boolean;
  preferences: string[];
  bio: string;
  joinedDate: string;
  completedTrips: number;
  languages: string[];
  vehicleTypes: string[];
  availability: Record<string, "available" | "booked" | "unavailable">;
  reviews: {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export function DriverProfilePage({ driverId }: DriverProfilePageProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/drivers/${driverId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load driver profile");
        const json = await res.json();
        setDriver(json);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [driverId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading driver...</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {driver &&
          (() => {
            const headerDriver = {
              id: driver.id,
              name: driver.name,
              photo: driver.photo || null,
              rating: driver.rating,
              reviewCount: driver.reviewCount,
              experience: driver.experience,
              location: driver.location,
              pricePerDay: driver.pricePerDay || 0,
              pricePerMonth: driver.pricePerMonth || 0,
              verified: driver.verified,
              preferences: driver.preferences,
              bio: driver.bio,
              joinedDate: driver.joinedDate,
              completedTrips: driver.completedTrips,
              languages: driver.languages,
            };
            return (
              <>
                <DriverProfileHeader
                  driver={headerDriver}
                  onBookNow={() => setIsBookingModalOpen(true)}
                  onReport={() => setIsReportModalOpen(true)}
                />
                <DriverProfileTabs driver={driver as never} />
              </>
            );
          })()}
      </main>

      {driver && (
        <EnhancedBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          driver={{
            ...driver,
            pricePerDay: driver.pricePerDay || 0,
            pricePerMonth: driver.pricePerMonth || 0,
          }}
        />
      )}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        driverId={driverId}
      />
    </div>
  );
}
