import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Driver } from "@/lib/models";
import mongoose from "mongoose";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const identifier = params.id;
    let driver = await Driver.findOne({
      drivingLicenseNumber: identifier,
    }).populate("userId", "name profilePhoto emailVerified createdAt");
    if (!driver && mongoose.isValidObjectId(identifier)) {
      driver = await Driver.findById(identifier).populate(
        "userId",
        "name profilePhoto emailVerified createdAt"
      );
    }
    if (!driver || !driver.approved) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    interface PopulatedUser {
      name?: string;
      profilePhoto?: string;
      emailVerified?: boolean;
    }
    interface RatingDoc {
      _id?: { toString(): string };
      score: number;
      description: string;
      createdAt: Date;
    }
    interface DriverDoc {
      _id: { toString(): string };
      userId?: PopulatedUser;
      averageRating?: number;
      ratings: RatingDoc[];
      totalRides: number;
      location: string;
      approved: boolean;
      bio?: string;
      createdAt: Date;
    }
    const d = driver as unknown as DriverDoc;
    interface ExtendedDriverDoc extends DriverDoc {
      experienceYears?: number;
      pricePerDay?: number;
      pricePerMonth?: number;
      preferences?: string[];
      languages?: string[];
      vehicleTypes?: string[];
      availability?: Array<{ date: Date; status: string }>;
    }
    const ed = d as ExtendedDriverDoc;
    const experienceLabel =
      ed.experienceYears && ed.experienceYears >= 5
        ? "5+ years"
        : ed.experienceYears && ed.experienceYears >= 3
        ? "3-5 years"
        : ed.experienceYears && ed.experienceYears >= 1
        ? "1-2 years"
        : "<1 year";
    const availabilityMap = (ed.availability || []).reduce<
      Record<string, string>
    >((acc, slot) => {
      const dateKey = new Date(slot.date).toISOString().split("T")[0];
      acc[dateKey] = slot.status;
      return acc;
    }, {});
    const response = {
      id: ed._id.toString(),
      userId: (driver as any).userId?._id?.toString?.() || undefined,
      name: ed.userId?.name || "Unnamed",
      photo: ed.userId?.profilePhoto || null,
      rating: ed.averageRating || 0,
      reviewCount: ed.ratings?.length || 0,
      experience: experienceLabel,
      location: ed.location,
      pricePerDay: ed.pricePerDay ?? 0,
      pricePerMonth: ed.pricePerMonth ?? 0,
      verified: Boolean(ed.userId?.emailVerified && ed.approved),
      preferences: ed.preferences || [],
      bio: ed.bio || "",
      joinedDate: ed.createdAt,
      completedTrips: ed.totalRides,
      languages: ed.languages || [],
      vehicleTypes: ed.vehicleTypes || [],
      availability: availabilityMap,
      reviews: d.ratings
        .slice(-10)
        .reverse()
        .map((r) => ({
          id: r._id?.toString() || "",
          userName: "User", // TODO: populate author name
          rating: r.score,
          comment: r.description,
          date: r.createdAt,
        })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Driver detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
