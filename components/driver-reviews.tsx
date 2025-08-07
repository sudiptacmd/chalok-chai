"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface Review {
  id: string
  userName: string
  rating: number
  comment: string
  date: string
}

interface DriverReviewsProps {
  reviews: Review[]
}

export function DriverReviews({ reviews }: DriverReviewsProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {review.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{review.userName}</h4>
                    <span className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>

                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}

          {reviews.length === 0 && <div className="text-center py-8 text-muted-foreground">No reviews yet</div>}
        </div>
      </CardContent>
    </Card>
  )
}
