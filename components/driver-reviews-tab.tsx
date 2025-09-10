"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, TrendingUp } from "lucide-react";

interface Review {
  _id: string;
  score: number;
  description: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  bookingId?: string;
}

interface DriverReviewsTabProps {
  driverId: string;
}

export function DriverReviewsTab({ driverId }: DriverReviewsTabProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStars: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/drivers/${driverId}/reviews`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);

          // Calculate stats from reviews
          const totalReviews = data.reviews?.length || 0;
          if (totalReviews > 0) {
            const ratingsCount = data.reviews.reduce(
              (acc: Record<string, number>, review: Review) => {
                acc[`${review.score}Stars`] =
                  (acc[`${review.score}Stars`] || 0) + 1;
                return acc;
              },
              {}
            );

            const averageRating =
              data.reviews.reduce(
                (sum: number, review: Review) => sum + review.score,
                0
              ) / totalReviews;

            setStats({
              averageRating: Math.round(averageRating * 10) / 10,
              totalReviews,
              fiveStars: ratingsCount["5Stars"] || 0,
              fourStars: ratingsCount["4Stars"] || 0,
              threeStars: ratingsCount["3Stars"] || 0,
              twoStars: ratingsCount["2Stars"] || 0,
              oneStars: ratingsCount["1Stars"] || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchReviews();
    }
  }, [driverId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getPercentage = (count: number) => {
    return Math.round((count / stats.totalReviews) * 100);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      ) : (
        <>
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
                {stats.totalReviews > 0 ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold mb-2">
                        {stats.averageRating}
                      </div>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        {renderStars(Math.round(stats.averageRating))}
                      </div>
                      <p className="text-muted-foreground">
                        {stats.totalReviews} total reviews
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { stars: 5, count: stats.fiveStars },
                        { stars: 4, count: stats.fourStars },
                        { stars: 3, count: stats.threeStars },
                        { stars: 2, count: stats.twoStars },
                        { stars: 1, count: stats.oneStars },
                      ].map(({ stars, count }) => (
                        <div
                          key={stars}
                          className="flex items-center space-x-3"
                        >
                          <span className="text-sm w-6">{stars}★</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${getPercentage(count)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews yet</p>
                  </div>
                )}
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
                    <span>Average Rating</span>
                    <span className="font-semibold">
                      {stats.averageRating}/5
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Reviews</span>
                    <span className="font-semibold">{stats.totalReviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>5-Star Reviews</span>
                    <span className="font-semibold">{stats.fiveStars}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Recent Reviews</span>
                    <span className="font-semibold">
                      {reviews.slice(0, 5).length}
                    </span>
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
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.slice(0, 10).map((review) => (
                    <div
                      key={review._id}
                      className="border-b pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {review.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              {review.author.name}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {renderStars(review.score)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ({review.score}/5)
                            </span>
                            {review.bookingId && (
                              <span className="text-sm text-muted-foreground">
                                • From booking
                              </span>
                            )}
                          </div>

                          {review.description && (
                            <p className="text-muted-foreground">
                              {review.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No reviews yet. Complete some bookings to start receiving
                    reviews!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
