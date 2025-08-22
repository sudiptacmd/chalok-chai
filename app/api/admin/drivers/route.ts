import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Driver, User, Booking } from "@/lib/models";
import { sendDriverApprovalEmail } from "@/lib/email";

// Get pending driver applications (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get pending drivers with user information (include legacy docs without 'approved')
    const pendingDrivers = await Driver.find({
      $or: [{ approved: false }, { approved: { $exists: false } }],
    })
      .populate(
        "userId",
        "name email phone emailVerified createdAt profilePhoto"
      )
      .sort({ createdAt: -1 });

    return NextResponse.json(pendingDrivers);
  } catch (error) {
    console.error("Get pending drivers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Approve or reject driver application
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { driverId, approved } = await request.json();

    if (!driverId || typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "Driver ID and approval status are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const driver = await Driver.findById(driverId).populate("userId");

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    if (driver.approved && approved) {
      return NextResponse.json(
        { error: "Driver is already approved" },
        { status: 400 }
      );
    }

    // Update driver approval status
    driver.approved = approved;
    await driver.save();

    // Send notification email
    const emailResult = await sendDriverApprovalEmail(
      driver.userId.email,
      driver.userId.name,
      approved
    );

    if (!emailResult.success) {
      console.error("Failed to send approval email:", emailResult.error);
    }

    return NextResponse.json({
      message: `Driver ${approved ? "approved" : "rejected"} successfully`,
      driver: {
        id: driver._id,
        approved: driver.approved,
        userId: driver.userId._id,
        name: driver.userId.name,
        email: driver.userId.email,
      },
    });
  } catch (error) {
    console.error("Update driver approval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete driver and associated user account (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get("driverId");
    const userId = searchParams.get("userId");

    if (!driverId && !userId) {
      return NextResponse.json(
        { error: "Either driver ID or user ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    let driver;
    if (driverId) {
      driver = await Driver.findById(driverId).populate("userId");
    } else if (userId) {
      driver = await Driver.findOne({ userId }).populate("userId");
    }

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Check if driver has active bookings
    const activeBookings = await Booking.find({
      driverId: driver._id,
      status: { $in: ["pending", "accepted"] },
    });

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete driver with active bookings. Please complete or cancel all bookings first.",
          activeBookings: activeBookings.length 
        },
        { status: 400 }
      );
    }

    // Delete the driver record
    await Driver.findByIdAndDelete(driver._id);

    // Delete the associated user record
    await User.findByIdAndDelete(driver.userId._id);

    return NextResponse.json({
      message: "Driver and user account deleted successfully",
      deletedDriver: {
        driverId: driver._id,
        userId: driver.userId._id,
        name: driver.userId.name,
        email: driver.userId.email,
      },
    });
  } catch (error) {
    console.error("Delete driver error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
