"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Car,
  DollarSign,
  Calendar,
  Star,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsData {
  totalUsers: number;
  totalDrivers: number;
  totalCarOwners: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  averageBookingValue: number;
  recentBookings: {
    id: string;
    driverName: string;
    amount: number;
    date: string;
    status: string;
  }[];
}

export function PlatformAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(), 30000); // refresh 30s
    return () => clearInterval(id);
  }, [load]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-600 text-sm">{error}</p>
        <Button onClick={load} size="sm">
          Retry
        </Button>
      </div>
    );
  }

  const skeleton = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6 h-32" />
        </Card>
      ))}
    </div>
  );

  const stats = data && [
    {
      title: "Total Users",
      value: data.totalUsers.toLocaleString(),
      icon: Users,
    },
    {
      title: "Active Drivers",
      value: data.totalDrivers.toLocaleString(),
      icon: Car,
    },
    {
      title: "Total Revenue",
      value: `৳${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Average Rating",
      value: data.averageRating.toString(),
      icon: Star,
    },
    {
      title: "Active Bookings",
      value: data.activeBookings.toString(),
      icon: Calendar,
    },
    {
      title: "Avg Booking Value",
      value: `৳${data.averageBookingValue.toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {lastUpdated
            ? `Last updated ${lastUpdated.toLocaleTimeString()}`
            : "Loading..."}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          className="bg-transparent"
        >
          <RefreshCcw
            className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
          />{" "}
          Refresh
        </Button>
      </div>

      {!data && skeleton}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats!.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Completed Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentBookings.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No recent bookings
                    </p>
                  )}
                  {data.recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{booking.driverName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ৳{booking.amount.toLocaleString()}
                        </p>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-700">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Car Owners</span>
                    <span className="font-semibold">{data.totalCarOwners}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Verified Drivers</span>
                    <span className="font-semibold">{data.totalDrivers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed Bookings</span>
                    <span className="font-semibold">
                      {data.completedBookings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Rating</span>
                    <span className="font-semibold">{data.averageRating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Booking Value</span>
                    <span className="font-semibold">
                      ৳{data.averageBookingValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Revenue</span>
                    <span className="font-semibold">
                      ৳{data.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
