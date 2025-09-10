import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Driver } from "@/lib/models";
import dbConnect from "@/lib/mongodb";

// PATCH: Update availability for a driver
import type { NextRequest } from "next/server";
export async function PATCH(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== "driver") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  let dates: string[] = [];
  let status: "unavailable" | "booked" = "unavailable";
  if (body.dates && Array.isArray(body.dates)) {
    dates = body.dates;
    status = body.status;
  } else if (body.date && body.status) {
    dates = [body.date];
    status = body.status;
  }
  if (!dates.length || !["unavailable", "booked"].includes(status)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const driver = await Driver.findOne({ userId: session.user.id });
  if (!driver) {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  }
  // Ensure availability is always an array
  if (!Array.isArray(driver.availability)) {
    driver.availability = [];
  }
  // Remove all unavailable dates and replace with new ones
  driver.availability = driver.availability.filter(
    (d: { date: string; status: string }) => d.status === "booked"
  );

  // Add new unavailable dates
  if (dates.length > 0 && status === "unavailable") {
    dates.forEach((date) => {
      driver.availability.push({ date, status: "unavailable" });
    });
  }
  await driver.save();
  return NextResponse.json({
    success: true,
    availability: driver.availability,
  });
}

// GET: Get availability for a driver
export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== "driver") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const driver = await Driver.findOne({ userId: session.user.id });
  if (!driver) {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  }
  return NextResponse.json({ availability: driver.availability || [] });
}
