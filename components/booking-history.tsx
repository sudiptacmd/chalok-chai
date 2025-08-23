"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Booking = {
  _id: string;
  bookingType: "daily" | "monthly";
  startDate?: string;
  endDate?: string;
  selectedDates?: string[];
  pickupLocation: string;
  totalCost: number;
  status: string;
  driverId?: { userId?: { name?: string } };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500/20 text-green-700";
    case "active":
      return "bg-blue-500/20 text-blue-700";
    case "cancelled":
      return "bg-red-500/20 text-red-700";
    case "pending":
      return "bg-yellow-500/20 text-yellow-700";
    default:
      return "bg-gray-500/20 text-gray-700";
  }
};

export function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/bookings", { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to load bookings");
        const json = await res.json();
        setBookings(json.bookings || []);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError"))
          console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
            {!loading && bookings.length === 0 && (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            )}
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">
                      {booking.driverId?.userId?.name || "Driver"}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.pickupLocation}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <div className="font-medium capitalize">
                      {booking.bookingType}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="font-medium">
                      {booking.bookingType === "daily" &&
                      booking.selectedDates?.length
                        ? `${booking.selectedDates.length} day(s)`
                        : `${
                            booking.startDate
                              ? new Date(booking.startDate).toLocaleDateString()
                              : ""
                          } - ${
                            booking.endDate
                              ? new Date(booking.endDate).toLocaleDateString()
                              : ""
                          }`}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Cost:</span>
                    <div className="font-medium">
                      ৳{booking.totalCost.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    disabled={booking.status !== "accepted"}
                    onClick={async () => {
                      try {
                        // Ensure/create conversation with driver user
                        const driverRes = await fetch(`/api/drivers/${(booking as any).driverId?._id || ""}`);
                        if (!driverRes.ok) return;
                        const d = await driverRes.json();
                        const otherUserId = d.userId;
                        if (!otherUserId) return;
                        const cr = await fetch('/api/messages/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ otherUserId })});
                        if (!cr.ok) return;
                        const { conversationId } = await cr.json();
                        router.push(`/messages/${conversationId}`);
                      } catch {}
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
