"use client";


import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, MapPin, DollarSign, Inbox, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"


type Booking = {
  _id: string;
  bookingType: "daily" | "monthly";
  startDate?: string;
  endDate?: string;
  selectedDates?: string[];
  pickupLocation: string;
  totalCost: number;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
  ownerUserId?: { name?: string; email?: string };
  createdAt?: string;
  notes?: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "accepted":
      return "bg-green-500/20 text-green-700";
    case "completed":
      return "bg-blue-500/20 text-blue-700";
    case "cancelled":
      return "bg-red-500/20 text-red-700";
    default:
      return "bg-gray-500/20 text-gray-700";
  }
};

export function DriverBookings() {

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()


  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings?status=accepted");
      if (!res.ok) throw new Error("Failed to load bookings");
      const json = await res.json();
      setBookings(json.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    if (typeof window !== "undefined") {
      window.addEventListener("driver:bookingsUpdated", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("driver:bookingsUpdated", handler);
      }
    };
  }, []);

  const hasBookings = useMemo(() => bookings.length > 0, [bookings]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
            {!loading && !hasBookings && (
              <div className="text-center py-12">
                <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No accepted bookings yet
                </p>
              </div>
            )}
            {bookings.map((b) => (
              <div key={b._id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {b.ownerUserId?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {b.ownerUserId?.name || "Client"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {b.createdAt
                          ? new Date(b.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(b.status)}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium capitalize">
                        {b.bookingType}
                      </div>
                      <div className="text-muted-foreground">
                        {b.bookingType === "daily"
                          ? `${b.selectedDates?.length || 0} day(s)`
                          : b.startDate
                          ? `${new Date(b.startDate).toLocaleDateString()} - ${
                              b.endDate
                                ? new Date(b.endDate).toLocaleDateString()
                                : ""
                            }`
                          : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Pickup</div>
                      <div className="text-muted-foreground">
                        {b.pickupLocation}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        ৳{b.totalCost.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Total</div>
                    </div>
                  </div>
                </div>

                {b.bookingType === "daily" &&
                  b.selectedDates &&
                  b.selectedDates.length > 0 && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-2">Dates</p>
                      <div className="flex flex-wrap gap-2">
                        {b.selectedDates.map((d) => (
                          <span
                            key={d}
                            className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                          >
                            {new Date(d).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {b.notes && (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Notes:</strong> {b.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    disabled={b.status !== "accepted"}
                    onClick={async () => {
                      try {
                        // Ensure/create conversation with owner
                        // Fetch current user's conversations requires owner user id
                        const ownerUserId = (b as any).ownerUserId?._id || (b as any).ownerUserId?.toString?.()
                        if (!ownerUserId) return
                        const cr = await fetch('/api/messages/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ otherUserId: ownerUserId })})
                        if (!cr.ok) return
                        const { conversationId } = await cr.json()
                        router.push(`/messages/${conversationId}`)
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
