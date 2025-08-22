"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Check,
  X,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

type Booking = {
  _id: string;
  bookingType: "daily" | "monthly";
  startDate?: string;
  endDate?: string;
  selectedDates?: string[];
  pickupLocation: string;
  totalCost: number;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
  ownerUserId?: { name?: string };
  createdAt?: string;
  notes?: string;
};

export function HireRequests() {
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings?status=pending");
      if (!res.ok) throw new Error("Failed to load requests");
      const json = await res.json();
      setRequests(json.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (
    bookingId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action }),
      });
      if (!res.ok) throw new Error("Failed to update request");
      setRequests((prev) =>
        prev.map((r) =>
          r._id === bookingId
            ? { ...r, status: action === "accept" ? "accepted" : "rejected" }
            : r
        )
      );
      toast.success(
        action === "accept" ? "Request accepted" : "Request rejected"
      );
      // Notify other components (e.g., availability calendar, bookings tab) to refresh
      if (typeof window !== "undefined" && action === "accept") {
        window.dispatchEvent(new CustomEvent("driver:availabilityUpdated"))
        window.dispatchEvent(new CustomEvent("driver:bookingsUpdated"))
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700";
      case "accepted":
        return "bg-green-500/20 text-green-700";
      case "rejected":
        return "bg-red-500/20 text-red-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests]
  );
  const otherRequests = useMemo(
    () => requests.filter((r) => r.status !== "pending"),
    [requests]
  );

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Requests ({pendingRequests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {request.ownerUserId?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {request.ownerUserId?.name || "Client"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium capitalize">
                          {request.bookingType}
                        </div>
                        <div className="text-muted-foreground">
                          {request.bookingType === "daily"
                            ? `${request.selectedDates?.length || 0} day(s)`
                            : request.startDate
                            ? `${new Date(
                                request.startDate
                              ).toLocaleDateString()} - ${
                                request.endDate
                                  ? new Date(
                                      request.endDate
                                    ).toLocaleDateString()
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
                          {request.pickupLocation}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          ৳{request.totalCost.toLocaleString()}
                        </div>
                        <div className="text-muted-foreground">
                          {request.bookingType === "daily"
                            ? "Daily"
                            : "Monthly"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Show selected dates for daily requests */}
                  {request.bookingType === "daily" &&
                    request.selectedDates &&
                    request.selectedDates.length > 0 && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-2">
                          Requested Dates
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {request.selectedDates.map((d) => (
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

                  {request.notes && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>Notes:</strong> {request.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleAction(request._id, "reject")}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleAction(request._id, "accept")}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {otherRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {otherRequests.map((request) => (
                <div
                  key={request._id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {request.ownerUserId?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {request.ownerUserId?.name || "Client"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium capitalize">
                        {request.bookingType}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <div className="font-medium">
                        {request.pickupLocation}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <div className="font-medium">
                        ৳{request.totalCost.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No hire requests yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
