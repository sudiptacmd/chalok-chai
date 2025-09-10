"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { DriverDashboardTabs } from "@/components/driver-dashboard-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileData {
  user: {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    type: string;
  };
  profile: {
    _id: string;
    userId: string;
    [key: string]: unknown;
  };
}

export function DriverDashboardPage() {
  const [driverData, setDriverData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setDriverData(data);
        } else {
          setError("Failed to load driver profile");
        }
      } catch {
        setError("An error occurred while loading your profile");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Driver Profile Header */}
        {driverData && (
          <div className="mb-8 p-6 bg-card rounded-lg border">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={driverData?.user?.profilePhoto || undefined}
                  alt={driverData?.user?.name || ""}
                />
                <AvatarFallback className="text-lg">
                  {driverData?.user?.name
                    ? driverData.user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : "D"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {driverData?.user?.name}!
                </h1>
                <p className="text-muted-foreground">
                  Driver Dashboard - Manage your driving services and bookings
                </p>
              </div>
            </div>
          </div>
        )}

        {!driverData && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your driving services and bookings
            </p>
          </div>
        )}

        <DriverDashboardTabs driverId={driverData?.profile?._id} />
      </main>
    </div>
  );
}
