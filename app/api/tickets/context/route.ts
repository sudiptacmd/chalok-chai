import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Booking, Driver } from "@/lib/models";

// Returns distinct counterpart users and bookings to populate ticket creation form

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const userId = session.user.id;

  // Fetch bookings where current user is involved and status accepted/completed
  const statusFilter: { $in: string[] } = { $in: ["accepted", "completed"] };
  // Need driver doc if user is driver
  let driverDoc = null;
  if (session.user.type === "driver") {
    driverDoc = await Driver.findOne({ userId });
    if (!driverDoc) return NextResponse.json({ users: [], bookings: [] });
  }

  const query: Record<string, unknown> = {
    status: statusFilter,
    $or: [
      { ownerUserId: userId },
      driverDoc ? { driverId: driverDoc._id } : null,
    ].filter(Boolean),
  };
  const bookings = await Booking.find(query)
    .populate({ path: "ownerUserId", select: "name email type" })
    .populate({
      path: "driverId",
      populate: { path: "userId", select: "name email type" },
    })
    .sort({ createdAt: -1 })
    .lean();

  const counterpartsMap = new Map<
    string,
    { _id: string; name: string; email: string }
  >();
  for (const b of bookings) {
    const ownerUser = b.ownerUserId as {
      _id: string;
      name: string;
      email: string;
    };
    const driverUser = (
      b.driverId as { userId: { _id: string; name: string; email: string } }
    )?.userId;
    if (ownerUser && ownerUser._id.toString() !== userId) {
      counterpartsMap.set(ownerUser._id.toString(), ownerUser);
    }
    if (driverUser && driverUser._id.toString() !== userId) {
      counterpartsMap.set(driverUser._id.toString(), driverUser);
    }
  }
  const counterparts = Array.from(counterpartsMap.values());
  // Simplify booking data for client
  const bookingOptions = bookings.map((raw) => {
    const b = raw as Record<string, unknown>;
    return {
      id: b._id?.toString(),
      type: b.bookingType,
      status: b.status,
      startDate: b.startDate,
      endDate: b.endDate,
      selectedDates: b.selectedDates,
      ownerUserId: (
        b.ownerUserId as { _id?: { toString(): string } }
      )?._id?.toString(),
      driverUserId: (
        b.driverId as { userId?: { _id?: { toString(): string } } }
      )?.userId?._id?.toString(),
    };
  });

  return NextResponse.json({ users: counterparts, bookings: bookingOptions });
}
