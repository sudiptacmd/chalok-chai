import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Driver } from "@/lib/models";

// GET /api/drivers/search?location=...&minPrice=..&maxPrice=..&experience=5+&verified=true&limit=20&page=1
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const location = searchParams.get("location")?.trim();
    const bookingType =
      searchParams.get("bookingType") === "monthly" ? "monthly" : "daily";
    const minPrice = Number(searchParams.get("minPrice") || 0);
    const maxPrice = Number(searchParams.get("maxPrice") || 1_000_000);
    const preferences = searchParams.getAll("preference");
    const languages = searchParams.getAll("language");
    const experience = searchParams.get("experience");
    const verified = searchParams.get("verified");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit") || 20))
    );

    interface DriverQuery {
      approved: boolean;
      location?: { $regex: string; $options: string };
      totalRides?: { $gte: number; $lte?: number };
      pricePerDay?: { $gte: number; $lte: number };
      pricePerMonth?: { $gte: number; $lte: number };
      preferences?: { $all: string[] };
      languages?: { $all: string[] };
      experienceYears?: { $gte: number; $lte?: number };
    }
    const query: DriverQuery = { approved: true };

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Price filtering: assume pricePerDay stored via derived average cost? For now we don't store price fields in schema; placeholders for future.
    // If the model lacks price fields, skip filtering. Kept here for extensibility.

    if (verified === "true") {
      // A driver is considered verified if their associated user emailVerified = true and approved = true
    }

    const experienceMap: Record<string, { min: number; max?: number }> = {
      "1-2": { min: 1, max: 2 },
      "3-5": { min: 3, max: 5 },
      "5+": { min: 5 },
    };
    if (experience && experience !== "any" && experienceMap[experience]) {
      const { min, max } = experienceMap[experience];
      query.experienceYears = { $gte: min };
      if (max) query.experienceYears.$lte = max;
    }

    // Price filtering
    if (bookingType === "daily") {
      query.pricePerDay = { $gte: minPrice, $lte: maxPrice };
    } else {
      query.pricePerMonth = { $gte: minPrice, $lte: maxPrice };
    }

    if (preferences.length) {
      query.preferences = { $all: preferences };
    }
    if (languages.length) {
      query.languages = { $all: languages };
    }

    const skip = (page - 1) * limit;

    const drivers = await Driver.find(query)
      .sort({ averageRating: -1, experienceYears: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name profilePhoto emailVerified");

    const total = await Driver.countDocuments(query);

    interface PopulatedDriverDoc {
      _id: { toString(): string };
      userId?: {
        name?: string;
        profilePhoto?: string;
        emailVerified?: boolean;
      };
      averageRating?: number;
      ratings?: Array<unknown>;
      totalRides: number;
      location: string;
      approved: boolean;
      bio?: string;
      pricePerDay?: number;
      pricePerMonth?: number;
      experienceYears?: number;
      preferences?: string[];
      languages?: string[];
      vehicleTypes?: string[];
      availability?: Array<{ date: string | Date; status: string }>;
    }
    const results = (drivers as unknown as PopulatedDriverDoc[]).map((d) => ({
      id: d._id.toString(),
      name: d.userId?.name || "Unnamed",
      photo: d.userId?.profilePhoto || null,
      rating: d.averageRating || 0,
      reviewCount: d.ratings?.length || 0,
      experience:
        d.experienceYears && d.experienceYears >= 5
          ? "5+ years"
          : d.experienceYears && d.experienceYears >= 3
          ? "3-5 years"
          : d.experienceYears && d.experienceYears >= 1
          ? "1-2 years"
          : "<1 year",
      location: d.location,
      pricePerDay: d.pricePerDay ?? null,
      pricePerMonth: d.pricePerMonth ?? null,
      verified: Boolean(d.userId?.emailVerified && d.approved),
      preferences: d.preferences || [],
      bio: d.bio || "",
      availability: (d.availability || []).reduce<Record<string, string>>(
        (acc, slot) => {
          const dateStr =
            typeof slot.date === "string"
              ? slot.date
              : new Date(slot.date).toISOString().split("T")[0];
          acc[dateStr] = slot.status;
          return acc;
        },
        {}
      ),
    }));

    return NextResponse.json({
      page,
      total,
      pageSize: limit,
      results,
    });
  } catch (error) {
    console.error("Driver search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
