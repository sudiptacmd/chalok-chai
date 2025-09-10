"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Star, Filter } from "lucide-react";

interface SearchFiltersProps {
  filters: {
    location: string;
    bookingType: "daily" | "monthly";
    numberOfDays: number;
    numberOfMonths?: number;
    priceRange: number[];
    experience: string;
    preferences: string[];
  };
  onFiltersChange: (filters: Record<string, unknown>) => void;
}

const preferences = [
  "Non-smoker",
  "Pet-friendly",
  "English speaking",
  "Female driver",
  "Experienced with luxury cars",
  "Available for long trips",
];

export function SearchFilters({
  filters,
  onFiltersChange,
}: SearchFiltersProps) {
  const updateFilter = (key: string, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const togglePreference = (preference: string) => {
    const newPreferences = filters.preferences.includes(preference)
      ? filters.preferences.filter((p) => p !== preference)
      : [...filters.preferences, preference];
    updateFilter("preferences", newPreferences);
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Search Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Location</span>
          </Label>
          <Input
            placeholder="Enter location"
            value={filters.location}
            onChange={(e) => updateFilter("location", e.target.value)}
          />
        </div>

        {/* Booking Type */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Booking Type</span>
          </Label>
          <Select
            value={filters.bookingType}
            onValueChange={(value) => updateFilter("bookingType", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection for Daily */}
        {filters.bookingType === "daily" && (
          <div className="space-y-2">
            <Label>Booking Dates</Label>
            <p className="text-xs text-muted-foreground">
              You can select specific dates after choosing a driver
            </p>
          </div>
        )}

        {/* Number of Months for Monthly */}
        {filters.bookingType === "monthly" && (
          <div className="space-y-2">
            <Label>Number of Months</Label>
            <Select
              value={filters.numberOfMonths?.toString() || "1"}
              onValueChange={(value) =>
                updateFilter("numberOfMonths", Number.parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {month} {month === 1 ? "Month" : "Months"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Price Range (BDT)</span>
          </Label>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter("priceRange", value)}
              max={10000}
              min={0}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>৳{filters.priceRange[0]}</span>
              <span>৳{filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Experience</span>
          </Label>
          <Select
            value={filters.experience}
            onValueChange={(value) => updateFilter("experience", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1-2">1-2 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="5+">5+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <Label>Preferences</Label>
          <div className="space-y-2">
            {preferences.map((preference) => (
              <div key={preference} className="flex items-center space-x-2">
                <Checkbox
                  id={preference}
                  checked={filters.preferences.includes(preference)}
                  onCheckedChange={() => togglePreference(preference)}
                />
                <Label htmlFor={preference} className="text-sm">
                  {preference}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full">Apply Filters</Button>
      </CardContent>
    </Card>
  );
}
