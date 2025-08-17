import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { User, Driver, Owner } from "@/lib/models";

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
      { $match: { "bookingHistory.status": { $in: ["pending", "confirmed"] } } },
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
          recent: {
            $push: {
              driverId: "$bookingHistory.driverId",
              amount: "$bookingHistory.amount",
              endDate: "$bookingHistory.endDate",
              startDate: "$bookingHistory.startDate",
              status: "$bookingHistory.status",
              createdAt: "$bookingHistory.createdAt",
            },
          },
        },
      },
    ]);

    const completedStats = completedAgg[0] || {
      completed: 0,
      revenue: 0,
      avgBookingValue: 0,
      recent: [],
    };

    let recentBookings: AnalyticsPayload["recentBookings"] = [];
    if (completedStats.recent.length) {
      const recent = (completedStats.recent as RecentBookingRaw[])
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.endDate || b.startDate || new Date(0)).getTime() -
            new Date(a.createdAt || a.endDate || a.startDate || new Date(0)).getTime()
        )
        .slice(0, 10);
      const driverIds = recent.map((r) => r.driverId).filter(Boolean) as string[];
      const drivers = await Driver.find({ _id: { $in: driverIds } }).populate("userId", "name");
      interface PopulatedDriver { _id: string; userId?: { name?: string } }
      const driverMap = new Map<string, string>(
        (drivers as unknown as PopulatedDriver[]).map((d) => [
          d._id.toString(),
          d.userId?.name || "Driver",
        ])
      );
      recentBookings = recent.map((r, i) => ({
        id: i.toString(),
        driverName: r.driverId ? driverMap.get(r.driverId.toString()) || "Unknown" : "Unknown",
        amount: r.amount || 0,
        date: (r.endDate || r.startDate || r.createdAt || new Date()) as Date,
        status: r.status || "completed",
      }));
    }

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
