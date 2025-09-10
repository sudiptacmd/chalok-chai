import { NextResponse } from "next/server";
import { Driver } from "@/lib/models";
import dbConnect from "@/lib/mongodb";

// GET: List drivers available for a given date
import type { NextRequest } from "next/server";
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  // Only show drivers who are NOT unavailable or booked for the given date
  let drivers;
  if (date) {
    drivers = await Driver.find({
      $or: [
        {
          availability: {
            $not: {
              $elemMatch: { date, status: { $in: ["unavailable", "booked"] } },
            },
          },
        },
        { availability: { $exists: false } },
      ],
      approved: true,
    }).populate("userId", "name profilePhoto emailVerified");
  } else {
    drivers = await Driver.find({ approved: true }).populate(
      "userId",
      "name profilePhoto emailVerified"
    );
  }

  // Transform the data to include the correct structure for the frontend
  const transformedDrivers = drivers.map(
    (driver: {
      _id: { toString(): string };
      name?: string;
      userId?: {
        name?: string;
        profilePhoto?: string;
        emailVerified?: boolean;
      };
      averageRating?: number;
      ratings?: unknown[];
      experience?: string;
      location?: string;
      pricePerDay?: number;
      pricePerMonth?: number;
      approved: boolean;
      preferences?: string[];
      bio?: string;
      availability?: Array<{ date: Date; status: string }>;
    }) => {
      const experienceLabel = driver.experience || "Not specified";

      return {
        id: driver._id.toString(),
        name: driver.name || driver.userId?.name || "Unnamed",
        photo: driver.userId?.profilePhoto || null,
        rating: driver.averageRating || 0,
        reviewCount: driver.ratings?.length || 0,
        experience: experienceLabel,
        location: driver.location || "Location not specified",
        pricePerDay: driver.pricePerDay || 0,
        pricePerMonth: driver.pricePerMonth || 0,
        verified: Boolean(driver.userId?.emailVerified && driver.approved),
        preferences: driver.preferences || [],
        bio: driver.bio || "",
        availability: (driver.availability || []).reduce(
          (
            acc: Record<string, string>,
            slot: { date: Date; status: string }
          ) => {
            const dateKey = new Date(slot.date).toISOString().split("T")[0];
            acc[dateKey] = slot.status;
            return acc;
          },
          {}
        ),
      };
    }
  );

  return NextResponse.json({ drivers: transformedDrivers });
}
