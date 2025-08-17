import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";

// Test endpoint to verify suspended field
export async function GET() {
  try {
    await dbConnect();

    // Get a sample user to check the suspended field
    const sampleUser = await User.findOne({ type: { $ne: "admin" } })
      .select("name email suspended emailVerified type")
      .limit(1);

    if (!sampleUser) {
      return NextResponse.json({ message: "No users found" });
    }

    return NextResponse.json({
      message: "User data retrieved successfully",
      user: sampleUser,
      hasSuspendedField: sampleUser.suspended !== undefined,
      suspendedValue: sampleUser.suspended,
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
