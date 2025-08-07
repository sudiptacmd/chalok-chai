"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Calendar, DollarSign, Clock, Check, X, Inbox } from "lucide-react"

// Mock hire requests data
const mockRequests = [
  {
    id: "1",
    clientName: "Sarah Ahmed",
    bookingType: "daily",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    numberOfDays: 3,
    pickupLocation: "Dhanmondi, Dhaka",
    totalCost: 4500,
    status: "pending",
    requestTime: "2024-01-15T10:30:00Z",
    notes: "Need pickup at 8 AM sharp. Going to office daily.",
  },
  {
    id: "2",
    clientName: "Karim Hassan",
    bookingType: "monthly",
    startDate: "2024-02-01",
    endDate: "2024-02-29",
    pickupLocation: "Gulshan, Dhaka",
    totalCost: 35000,
    status: "pending",
    requestTime: "2024-01-14T15:45:00Z",
    notes: "Monthly arrangement for office commute. Flexible timing.",
  },
  {
    id: "3",
    clientName: "Fatima Khan",
    bookingType: "daily",
    startDate: "2024-01-18",
    endDate: "2024-01-18",
    numberOfDays: 1,
    pickupLocation: "Uttara, Dhaka",
    totalCost: 1500,
    status: "accepted",
    requestTime: "2024-01-13T09:15:00Z",
    notes: "Airport pickup required.",
  },
]

export function HireRequests() {
  const [requests, setRequests] = useState(mockRequests)

  const handleAccept = (requestId: string) => {
    setRequests(requests.map((req) => (req.id === requestId ? { ...req, status: "accepted" } : req)))
  }

  const handleReject = (requestId: string) => {
    setRequests(requests.map((req) => (req.id === requestId ? { ...req, status: "rejected" } : req)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700"
      case "accepted":
        return "bg-green-500/20 text-green-700"
      case "rejected":
        return "bg-red-500/20 text-red-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const otherRequests = requests.filter((req) => req.status !== "pending")

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
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
                <div key={request.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {request.clientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{request.clientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.requestTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium capitalize">{request.bookingType}</div>
                        <div className="text-muted-foreground">
                          {new Date(request.startDate).toLocaleDateString()}
                          {request.bookingType === "daily" &&
                            request.numberOfDays > 1 &&
                            ` - ${new Date(request.endDate).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Pickup</div>
                        <div className="text-muted-foreground">{request.pickupLocation}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">৳{request.totalCost.toLocaleString()}</div>
                        <div className="text-muted-foreground">
                          {request.bookingType === "daily"
                            ? `${request.numberOfDays} day${request.numberOfDays > 1 ? "s" : ""}`
                            : "Monthly"}
                        </div>
                      </div>
                    </div>
                  </div>

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
                      onClick={() => handleReject(request.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button className="flex-1" onClick={() => handleAccept(request.id)}>
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

      {/* Other Requests */}
      {otherRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {otherRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {request.clientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{request.clientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.requestTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium capitalize">{request.bookingType}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <div className="font-medium">{request.pickupLocation}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <div className="font-medium">৳{request.totalCost.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No hire requests yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
