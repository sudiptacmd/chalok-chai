import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Booking, Driver } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, rating, comment } = await request.json();

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid booking ID or rating" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the booking and verify ownership
    const booking = await Booking.findById(bookingId)
      .populate("ownerUserId", "email")
      .populate("driverId");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify the user owns this booking
    if (booking.ownerUserId.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if booking is completed/accepted (only these can be reviewed)
    if (!["completed", "accepted"].includes(booking.status)) {
      return NextResponse.json(
        { error: "Only completed or accepted bookings can be reviewed" },
        { status: 400 }
      );
    }

    // Update the booking with review
    booking.review = {
      rating,
      comment: comment || "",
      reviewedAt: new Date(),
    };

    await booking.save();

    // Update driver's ratings and average rating
    const driver = await Driver.findById(booking.driverId._id);
    if (driver) {
      // Check if this booking was already reviewed
      const existingReviewIndex = driver.ratings.findIndex(
        (r: { bookingId?: { toString(): string } }) =>
          r.bookingId && r.bookingId.toString() === bookingId
      );

      const reviewData = {
        score: rating,
        description: comment || "",
        author: booking.ownerUserId._id,
        createdAt: new Date(),
        bookingId: booking._id, // Add booking reference to avoid duplicates
      };

      if (existingReviewIndex >= 0) {
        // Update existing review
        driver.ratings[existingReviewIndex] = reviewData;
      } else {
        // Add new review
        driver.ratings.push(reviewData);
      }

      // Recalculate average rating
      driver.calculateAverageRating();
      await driver.save();
    }

    return NextResponse.json({
      message: "Review submitted successfully",
      review: booking.review,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
