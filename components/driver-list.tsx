"use client"

import { useEffect, useState } from "react";
import { EnhancedDriverCard } from "@/components/enhanced-driver-card";


interface DriverListProps {
  filters: {
    location: string;
    bookingType: "daily" | "monthly";
    numberOfDays: number;
    priceRange: number[];
    experience: string;
    preferences: string[];
  };
  date?: string; // Pass selected date for filtering
}

export function DriverList({ filters }: DriverListProps) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use today's date for filtering by default
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/drivers?date=${today}`)
      .then((res) => res.json())
      .then((data) => {
        setDrivers(data.drivers || []);
        setLoading(false);
      });
  }, [filters]);

  // Filter drivers client-side for location, price, experience, preferences
  const filteredDrivers = drivers.filter((driver) => {
    if (filters.location && !driver.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    const price = filters.bookingType === "daily" ? driver.pricePerDay : driver.pricePerMonth;
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false;
    }
    if (filters.experience && !driver.experience?.includes(filters.experience)) {
      return false;
    }
    if (filters.preferences.length > 0) {
      const hasPreference = filters.preferences.some((pref) => driver.preferences?.includes(pref));
      if (!hasPreference) return false;
    }
    return true;
  });

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
