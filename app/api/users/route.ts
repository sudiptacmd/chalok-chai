import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { User, Driver, Owner } from "@/lib/models";

// Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    await dbConnect();

    let query: any = { type: { $ne: "admin" } }; // Exclude admin users

    // Filter by user type if specified
    if (type && type !== "all") {
      query.type = type;
    }

    // Get users
    const users = await User.find(query)
      .select("name email phone type emailVerified suspended createdAt profilePhoto")
      .sort({ createdAt: -1 });

    // Get additional data for drivers and owners
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const userData = user.toObject();
        
        if (user.type === "driver") {
          const driver = await Driver.findOne({ userId: user._id });
          if (driver) {
            // Only include approved drivers or filter by status
            if (status === "approved" && !driver.approved) {
              return null;
            }
            return {
              ...userData,
              approved: driver.approved,
              location: driver.location,
              averageRating: driver.averageRating,
              totalRides: driver.totalRides,
              suspended: user.suspended || false,
              status: user.suspended ? "inactive" : (driver.approved ? "active" : "pending"),
            };
          } else {
            // If no driver record exists, exclude this user from the list
            return null;
          }
        } else if (user.type === "owner") {
          const owner = await Owner.findOne({ userId: user._id });
          if (owner) {
            return {
              ...userData,
              totalBookings: owner.bookingHistory?.length || 0,
              suspended: user.suspended || false,
              status: user.suspended ? "inactive" : (user.emailVerified ? "active" : "inactive"),
            };
          } else {
            // If no owner record exists, exclude this user from the list
            return null;
          }
        }

        return {
          ...userData,
          suspended: user.suspended || false,
          status: user.suspended ? "inactive" : (user.emailVerified ? "active" : "inactive"),
        };
      })
    );

    // Filter out null values (unapproved drivers when status=approved)
    const filteredUsers = enrichedUsers.filter(user => user !== null);

    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update user status (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle different actions
    switch (action) {
      case "suspend":
        user.suspended = true;
        break;
      case "activate":
        user.suspended = false;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await user.save();

    return NextResponse.json({
      message: `User ${action}d successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        suspended: user.suspended,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
