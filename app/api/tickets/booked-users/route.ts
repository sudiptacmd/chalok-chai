import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { User, Driver } from "@/lib/models";

// GET: Get users that can be involved in tickets (counterparts for current user)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get all users that the current user has interacted with through bookings
    // For simplicity, returning all non-admin users except the current user
    const users = await User.find({
      type: { $ne: "admin" },
      _id: { $ne: session.user.id },
    }).select("name email type");

    const drivers = await Driver.find()
      .populate("userId", "name email")
      .select("userId");

    const counterparts = [
      ...users.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        type: u.type,
      })),
      ...drivers.map((d) => ({
        _id: d.userId._id,
        name: d.userId.name,
        email: d.userId.email,
        type: "driver",
      })),
    ];

    // Remove duplicates based on _id
    const uniqueCounterparts = counterparts.filter(
      (user, index, self) =>
        index ===
        self.findIndex((u) => u._id.toString() === user._id.toString())
    );

    return NextResponse.json({ users: uniqueCounterparts });
  } catch (error) {
    console.error("Get booked users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
