"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, TrendingUp } from "lucide-react"

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    clientName: "Sarah Ahmed",
    rating: 5,
    comment: "Excellent driver! Very professional and punctual. Highly recommended.",
    date: "2024-01-10",
    bookingType: "daily",
  },
  {
    id: "2",
    clientName: "Karim Hassan",
    rating: 4,
    comment: "Good driving skills and friendly nature. Safe journey.",
    date: "2024-01-08",
    bookingType: "monthly",
  },
  {
    id: "3",
    clientName: "Fatima Khan",
    rating: 5,
    comment: "Amazing service! Very reliable and courteous driver.",
    date: "2024-01-05",
    bookingType: "daily",
  },
]

const stats = {
  averageRating: 4.8,
  totalReviews: 127,
  fiveStars: 89,
  fourStars: 28,
  threeStars: 8,
  twoStars: 2,
  oneStars: 0,
}

export function DriverReviewsTab() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const getPercentage = (count: number) => {
    return Math.round((count / stats.totalReviews) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Rating Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">{stats.averageRating}</div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <p className="text-muted-foreground">{stats.totalReviews} total reviews</p>
            </div>

            <div className="space-y-3">
              {[
                { stars: 5, count: stats.fiveStars },
                { stars: 4, count: stats.fourStars },
                { stars: 3, count: stats.threeStars },
                { stars: 2, count: stats.twoStars },
                { stars: 1, count: stats.oneStars },
              ].map(({ stars, count }) => (
                <div key={stars} className="flex items-center space-x-3">
                  <span className="text-sm w-6">{stars}★</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${getPercentage(count)}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performance Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Response Rate</span>
                <span className="font-semibold">98%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>On-time Rate</span>
                <span className="font-semibold">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Completion Rate</span>
                <span className="font-semibold">99%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Repeat Customers</span>
                <span className="font-semibold">67%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockReviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.clientName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{review.clientName}</h4>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                      <span className="text-sm text-muted-foreground capitalize">• {review.bookingType} booking</span>
                    </div>

                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
