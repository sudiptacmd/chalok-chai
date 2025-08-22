import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Driver } from "@/lib/models";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driverId = params.id;

    if (!driverId) {
      return NextResponse.json(
        { error: "Driver ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the driver and populate the reviews with author information
    const driver = await Driver.findById(driverId)
      .populate({
        path: "ratings.author",
        select: "name email",
      })
      .select("ratings averageRating");

    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    // Sort reviews by creation date (newest first)
    const sortedReviews = driver.ratings
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((rating: any) => ({
        _id: rating._id,
        score: rating.score,
        description: rating.description,
        author: {
          name: rating.author?.name || "Anonymous",
          email: rating.author?.email || "",
        },
        createdAt: rating.createdAt,
        bookingId: rating.bookingId || null,
      }));

    return NextResponse.json({
      reviews: sortedReviews,
      averageRating: driver.averageRating,
      totalReviews: driver.ratings.length,
    });
  } catch (error) {
    console.error("Error fetching driver reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
