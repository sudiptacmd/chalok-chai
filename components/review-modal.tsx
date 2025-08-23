"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    _id: string;
    driverId?: { userId?: { name?: string } };
    pickupLocation: string;
    totalCost: number;
    review?: {
      rating?: number;
      comment?: string;
    };
  };
  onReviewSubmit: (bookingId: string, rating: number, comment: string) => Promise<void>;
}

export function ReviewModal({ isOpen, onClose, booking, onReviewSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(booking.review?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(booking.review?.comment || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      await onReviewSubmit(booking._id, rating, comment);
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || rating;
  const isEditing = !!booking.review?.rating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Review" : "Rate Your Experience"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">
                  {booking.driverId?.userId?.name || "Driver"}
                </h4>
                <p className="text-sm text-gray-600">{booking.pickupLocation}</p>
              </div>
              <Badge variant="secondary">
                ৳{booking.totalCost.toLocaleString()}
              </Badge>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating *</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleStarClick(value)}
                  onMouseEnter={() => handleStarHover(value)}
                  onMouseLeave={handleStarLeave}
                  className="transition-colors hover:scale-110 transform duration-150"
                  disabled={submitting}
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {displayRating === 0 && "Click to rate"}
              {displayRating === 1 && "Poor"}
              {displayRating === 2 && "Fair"}
              {displayRating === 3 && "Good"}
              {displayRating === 4 && "Very Good"}
              {displayRating === 5 && "Excellent"}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comment (Optional)
            </label>
            <Textarea
              placeholder="Share your experience with this driver..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
              disabled={submitting}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {comment.length}/500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
              {submitting ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
