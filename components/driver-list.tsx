"use client";

import { useEffect, useState } from "react";
import { EnhancedDriverCard } from "@/components/enhanced-driver-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Driver shape expected by EnhancedDriverCard
interface Driver {
  id: string;
  name: string;
  photo: string; // ensure non-null for Image component
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

interface DriverListProps {
  filters: {
    location: string;
    bookingType: "daily" | "monthly";
    numberOfDays: number;
    priceRange: number[];
    experience: string;
    preferences: string[];
  };
}

export function DriverList({ filters }: DriverListProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Reset pagination when key filters change
  useEffect(() => {
    setPage(1);
  }, [
    filters.location,
    filters.experience,
    filters.priceRange,
    filters.bookingType,
  ]);

  // Load drivers from server with filters
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.location) params.set("location", filters.location);
        if (filters.experience && filters.experience !== "any")
          params.set("experience", filters.experience);
        params.set("bookingType", filters.bookingType);
        params.set("minPrice", filters.priceRange[0].toString());
        params.set("maxPrice", filters.priceRange[1].toString());
        params.set("page", page.toString());
        // preferences as repeated query params
        for (const pref of filters.preferences || [])
          params.append("preference", pref);

        const res = await fetch(`/api/drivers/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load drivers");
        type SearchResult = {
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
          availability: Record<string, string>;
        };
        type SearchResponse = {
          page: number;
          total: number;
          pageSize: number;
          results: SearchResult[];
        };
        const json: SearchResponse = await res.json();

        const mapped: Driver[] = (json.results || []).map((d) => {
          const av: Record<string, string> = d.availability || {};
          const availability = Object.fromEntries(
            Object.entries(av).map(([k, v]) => [
              k,
              v as "available" | "booked" | "unavailable",
            ])
          ) as Driver["availability"];
          return {
            id: String(d.id),
            name: d.name || "Unnamed",
            photo: d.photo || "",
            rating: typeof d.rating === "number" ? d.rating : 0,
            reviewCount: typeof d.reviewCount === "number" ? d.reviewCount : 0,
            experience: d.experience || "",
            location: d.location || "",
            pricePerDay: typeof d.pricePerDay === "number" ? d.pricePerDay : 0,
            pricePerMonth:
              typeof d.pricePerMonth === "number" ? d.pricePerMonth : 0,
            verified: Boolean(d.verified),
            preferences: Array.isArray(d.preferences) ? d.preferences : [],
            bio: d.bio || "",
            availability,
          };
        });

        setDrivers(mapped);
        setTotal(Number(json.total || 0));
        setPageSize(Number(json.pageSize || mapped.length || 20));
      } catch (e) {
        if (
          !(
            e instanceof DOMException &&
            (e as DOMException).name === "AbortError"
          )
        ) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [
    filters.location,
    filters.experience,
    filters.priceRange,
    filters.bookingType,
    filters.preferences,
    page,
  ]);

  const canGoNext = page * pageSize < total;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{total} drivers found</h2>
      </div>

      {loading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />{" "}
          <span>Loading drivers...</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {drivers.map((driver) => (
          <EnhancedDriverCard
            key={driver.id}
            driver={driver}
            bookingType={filters.bookingType}
          />
        ))}
      </div>

      {!loading && drivers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No drivers found matching your criteria. Try adjusting your filters.
          </p>
        </div>
      )}

      <div className="flex justify-center gap-4 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="bg-transparent"
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!canGoNext || loading}
          className="bg-transparent"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
