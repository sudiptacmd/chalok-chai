"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, X, MessageCircle, Calendar, Star, AlertTriangle } from "lucide-react"

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    type: "booking_request",
    title: "New Booking Request",
    message: "Sarah Ahmed has sent you a booking request for 3 days starting Jan 20, 2024",
    time: "2024-01-15T10:30:00Z",
    read: false,
    icon: Calendar,
  },
  {
    id: "2",
    type: "message",
    title: "New Message",
    message: "Karim Hassan: Hi, can we discuss the pickup time for tomorrow?",
    time: "2024-01-15T09:15:00Z",
    read: false,
    icon: MessageCircle,
  },
  {
    id: "3",
    type: "review",
    title: "New Review Received",
    message: "Fatima Khan left you a 5-star review: 'Amazing service! Very reliable.'",
    time: "2024-01-14T16:45:00Z",
    read: true,
    icon: Star,
  },
  {
    id: "4",
    type: "system",
    title: "Profile Verification",
    message: "Your driving license has been successfully verified.",
    time: "2024-01-14T14:20:00Z",
    read: true,
    icon: Check,
  },
  {
    id: "5",
    type: "reminder",
    title: "Booking Reminder",
    message: "You have a booking with Ahmed Khan starting in 2 hours.",
    time: "2024-01-14T08:00:00Z",
    read: true,
    icon: AlertTriangle,
  },
]

export function DriverNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== notificationId))
  }

  const unreadCount = notifications.filter((notif) => !notif.read).length

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking_request":
        return "text-blue-600"
      case "message":
        return "text-green-600"
      case "review":
        return "text-yellow-600"
      case "system":
        return "text-purple-600"
      case "reminder":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => {
            const IconComponent = notification.icon
            return (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 space-y-3 ${
                  !notification.read ? "bg-muted/30 border-primary/20" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full bg-muted ${getNotificationColor(notification.type)}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <h4 className={`font-medium ${!notification.read ? "text-primary" : ""}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.time).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  {!notification.read && (
                    <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No notifications</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
