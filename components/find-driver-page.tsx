"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { SearchFilters } from "@/components/search-filters";
import { DriverList } from "@/components/driver-list";

export function FindDriverPage() {
  const [filters, setFilters] = useState({
    location: "",
    bookingType: "daily" as "daily" | "monthly",
    numberOfDays: 1,
    numberOfMonths: 1,
    priceRange: [0, 5000],
    experience: "",
    preferences: [] as string[],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Driver</h1>
          <p className="text-muted-foreground">
            Search and filter drivers based on your preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SearchFilters
              filters={filters}
              onFiltersChange={(newFilters) =>
                setFilters(newFilters as typeof filters)
              }
            />
          </div>
          <div className="lg:col-span-3">
            <DriverList filters={filters} />
          </div>
        </div>
      </main>
    </div>
  );
}
