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
        { availability: { $not: { $elemMatch: { date, status: { $in: ["unavailable", "booked"] } } } } },
        { availability: { $exists: false } },
      ],
      approved: true,
    });
  } else {
    drivers = await Driver.find({ approved: true });
  }
  return NextResponse.json({ drivers });
}
