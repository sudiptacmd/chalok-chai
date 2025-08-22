import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Booking, Driver, User } from "@/lib/models";
import { sendBookingDecisionEmail, sendBookingRequestEmail } from "@/lib/email";

// POST /api/bookings -> create a booking request (owner only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.type !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();

    const {
      driverId,
      bookingType,
      selectedDates,
      startDate,
      numberOfMonths,
      pickupLocation,
      notes,
      totalCost,
    } = body;
    if (
      !driverId ||
      !bookingType ||
      !pickupLocation ||
      typeof totalCost !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const driver = await Driver.findById(driverId);
    if (!driver)
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });

    let endDate: Date | null = null;
    let selected: string[] = [];
    if (bookingType === "daily") {
      if (!Array.isArray(selectedDates) || selectedDates.length === 0) {
        return NextResponse.json(
          { error: "selectedDates required for daily booking" },
          { status: 400 }
        );
      }
      // Normalize and validate selected dates
      const unique = Array.from(
        new Set<string>(selectedDates.map((d: string) => String(d)))
      );
      const today = new Date();
      const todayMid = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      // Build a quick lookup for driver's blocked dates
      const blocked = new Set<string>();
      for (const a of driver.availability || []) {
        if (a.status === "booked" || a.status === "unavailable")
          blocked.add(a.date);
      }
      for (const ds of unique) {
        // basic YYYY-MM-DD check
        if (!/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
          return NextResponse.json(
            { error: `Invalid date format: ${ds}` },
            { status: 400 }
          );
        }
        const dt = new Date(ds);
        const dtMid = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        if (Number.isNaN(dt.getTime())) {
          return NextResponse.json(
            { error: `Invalid date value: ${ds}` },
            { status: 400 }
          );
        }
        if (dtMid < todayMid) {
          return NextResponse.json(
            { error: `Cannot book past date: ${ds}` },
            { status: 400 }
          );
        }
        if (blocked.has(ds)) {
          return NextResponse.json(
            { error: `Date not available: ${ds}` },
            { status: 409 }
          );
        }
      }
      selected = unique.sort();
    } else if (bookingType === "monthly") {
      if (!startDate || !numberOfMonths) {
        return NextResponse.json(
          {
            error: "startDate and numberOfMonths required for monthly booking",
          },
          { status: 400 }
        );
      }
      const s = new Date(startDate);
      const e = new Date(s);
      e.setMonth(e.getMonth() + Number(numberOfMonths));
      endDate = e;
    } else {
      return NextResponse.json(
        { error: "Invalid bookingType" },
        { status: 400 }
      );
    }

    const booking = await Booking.create({
      driverId: driver._id,
      ownerUserId: session.user.id,
      bookingType,
      selectedDates: selected,
      startDate: startDate ? new Date(startDate) : null,
      endDate,
      numberOfMonths: bookingType === "monthly" ? Number(numberOfMonths) : 0,
      pickupLocation,
      notes: notes || "",
      totalCost,
      status: "pending",
    });

    // Email driver about new request
    try {
      const driverUser = await User.findById(driver.userId);
      if (driverUser?.email) {
        await sendBookingRequestEmail(
          driverUser.email,
          driverUser.name || "Driver",
          {
            ownerName: session.user.name || "Owner",
            bookingType,
            selectedDates: booking.selectedDates,
            startDate: booking.startDate
              ? new Date(booking.startDate).toISOString().split("T")[0]
              : undefined,
            numberOfMonths: booking.numberOfMonths || undefined,
            pickupLocation,
            notes,
            totalCost,
          }
        );
      }
    } catch (e) {
      console.warn("Failed to send booking request email", e);
    }

    return NextResponse.json({
      success: true,
      bookingId: booking._id.toString(),
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/bookings -> list bookings for current user (owner sees theirs, driver sees assigned)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (session.user.type === "owner") {
      query.ownerUserId = session.user.id;
    } else if (session.user.type === "driver") {
      const driverDoc = await Driver.findOne({ userId: session.user.id });
      if (!driverDoc) return NextResponse.json({ bookings: [] });
      query.driverId = driverDoc._id;
    } else if (session.user.type === "admin") {
      // admins can filter by status if provided
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "driverId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({ path: "ownerUserId", select: "name email" });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("List bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings -> driver accept/reject a booking
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.type !== "driver") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();
    const { bookingId, action } = body as {
      bookingId: string;
      action: "accept" | "reject";
    };
    if (!bookingId || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const driver = await Driver.findOne({ userId: session.user.id });
    if (!driver)
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });

    const booking = await Booking.findOne({
      _id: bookingId,
      driverId: driver._id,
    });
    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    booking.status = action === "accept" ? "accepted" : "rejected";
    await booking.save();

    // Update availability for accepted daily bookings: mark selected dates as booked
    if (
      booking.status === "accepted" &&
      booking.bookingType === "daily" &&
      Array.isArray(booking.selectedDates)
    ) {
      const toBook = new Set<string>(booking.selectedDates as string[]);
      const existing = new Map<
        string,
        { date: string; status: "unavailable" | "booked" }
      >();
      const currentAvail = (driver.availability || []) as Array<{
        date: string;
        status: "unavailable" | "booked";
      }>;
      for (const a of currentAvail) existing.set(a.date, a);
      const toBookArr: string[] = Array.from(toBook);
      for (const d of toBookArr) {
        existing.set(d, { date: d, status: "booked" });
      }
      driver.availability = Array.from(existing.values());
      await driver.save();
    }

    // Notify owner via email
    try {
      const ownerUser = await User.findById(booking.ownerUserId);
      if (ownerUser?.email) {
        await sendBookingDecisionEmail(
          ownerUser.email,
          ownerUser.name || "Owner",
          booking.status === "accepted"
        );
      }
    } catch (e) {
      console.warn("Failed to send decision email", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
