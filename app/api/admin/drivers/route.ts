import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Driver, User } from "@/lib/models";
import { sendDriverApprovalEmail } from "@/lib/email";

// Get pending driver applications (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions); //current user session

    if (!session || session.user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get pending drivers with user information where:
    // - User type is 'driver'
    // - User emailVerified is true
    // - Driver approved is false
    const pendingDrivers = await Driver.find({
      approved: false,
    })
      .populate({
        path: "userId",
        match: { type: "driver", emailVerified: true },
        select: "name email phone emailVerified createdAt profilePhoto type",
      })
      .sort({ createdAt: -1 });

    // Filter out drivers where userId is null (didn't match the populate criteria)
    const validPendingDrivers = pendingDrivers.filter(
      (driver) => driver.userId !== null
    );

    return NextResponse.json(validPendingDrivers);
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

    if (approved) {
      // Approve the driver
      driver.approved = true;
      await driver.save();

      // Send approval email
      const emailResult = await sendDriverApprovalEmail(
        driver.userId.email,
        driver.userId.name,
        true
      );

      if (!emailResult.success) {
        console.error("Failed to send approval email:", emailResult.error);
      }

      return NextResponse.json({
        message: "Driver approved successfully",
        driver: {
          id: driver._id,
          approved: driver.approved,
          userId: driver.userId._id,
          name: driver.userId.name,
          email: driver.userId.email,
        },
      });
    } else {
      // Reject the driver - delete both driver and user entries
      const userId = driver.userId._id;
      const userEmail = driver.userId.email;
      const userName = driver.userId.name;

      // Delete driver entry first
      await Driver.findByIdAndDelete(driverId);

      // Delete user entry
      await User.findByIdAndDelete(userId);

      // Send rejection email
      const emailResult = await sendDriverApprovalEmail(
        userEmail,
        userName,
        false
      );

      if (!emailResult.success) {
        console.error("Failed to send rejection email:", emailResult.error);
      }

      return NextResponse.json({
        message: "Driver application rejected and entries deleted successfully",
        deletedUserId: userId,
        deletedDriverId: driverId,
      });
    }
  } catch (error) {
    console.error("Update driver approval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
