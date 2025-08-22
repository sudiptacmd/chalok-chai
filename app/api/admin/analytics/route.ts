import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { User, Driver, Owner, Booking } from "@/lib/models";

// Simple in-memory cache (per server instance) to limit heavy aggregation frequency
interface RecentBookingRaw {
  driverId?: string;
  amount?: number;
  endDate?: Date;
  startDate?: Date;
  status?: string;
  createdAt?: Date;
}

interface AnalyticsPayload {
  totalUsers: number;
  totalDrivers: number;
  totalCarOwners: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  averageBookingValue: number;
  recentBookings: Array<{
    id: string;
    driverName: string;
    amount: number;
    date: Date;
    status: string;
  }>;
}

let cache: { data: AnalyticsPayload; ts: number } | null = null;
const TTL_MS = 15000; // 15 seconds

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = Date.now();
    if (cache && now - cache.ts < TTL_MS) {
      return NextResponse.json({ ...cache.data, cached: true });
    }

    await dbConnect();

    const [totalUsers, totalDrivers, totalOwners] = await Promise.all([
      User.countDocuments({}),
      Driver.countDocuments({ approved: true }),
      Owner.countDocuments({}),
    ]);

    const activeBookingsAgg = await Owner.aggregate([
      { $unwind: "$bookingHistory" },
      {
        $match: { "bookingHistory.status": { $in: ["pending", "confirmed"] } },
      },
      { $count: "active" },
    ]);
    const activeBookings = activeBookingsAgg[0]?.active || 0;

    const completedAgg = await Owner.aggregate([
      { $unwind: "$bookingHistory" },
      { $match: { "bookingHistory.status": "completed" } },
      {
        $group: {
          _id: null,
          completed: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$bookingHistory.amount", 0] } },
          avgBookingValue: { $avg: { $ifNull: ["$bookingHistory.amount", 0] } },
        },
      },
    ]);

    const completedStats = completedAgg[0] || {
      completed: 0,
      revenue: 0,
      avgBookingValue: 0,
    };

    // Recent bookings section should show ACCEPTED bookings in descending time order
    const acceptedBookings = await Booking.find({ status: "accepted" })
      .sort({ updatedAt: -1 })
      .populate({ path: "driverId", populate: { path: "userId", select: "name" } })
      .lean();

    interface DriverPopulated { userId?: { name?: string } }
    const recentBookings: AnalyticsPayload["recentBookings"] = acceptedBookings.map((b: any) => ({
      id: b._id.toString(),
      driverName: (b.driverId as DriverPopulated)?.userId?.name || "Driver",
      amount: b.totalCost || 0,
      date: b.updatedAt || b.createdAt,
      status: b.status,
    }));

    const ratingAgg = await Driver.aggregate([
      { $match: { approved: true } },
      { $unwind: { path: "$ratings", preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, avgRating: { $avg: "$ratings.score" } } },
    ]);
    const averageRating = ratingAgg[0]?.avgRating || 0;

    const data: AnalyticsPayload = {
      totalUsers,
      totalDrivers,
      totalCarOwners: totalOwners,
      activeBookings,
      completedBookings: completedStats.completed,
      totalRevenue: completedStats.revenue,
      averageRating: Math.round(averageRating * 10) / 10,
      averageBookingValue: Math.round(completedStats.avgBookingValue || 0),
      recentBookings,
    };

    cache = { data, ts: now };
    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
