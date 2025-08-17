import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const { adminSecret } = await request.json();

    // Simple protection - use your own secret
    if (adminSecret !== "chalokchai-admin-seed-2025") {
      return NextResponse.json(
        { error: "Invalid admin secret" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Update existing users to have suspended field if they don't
    const updateResult = await User.updateMany(
      { suspended: { $exists: false } },
      { $set: { suspended: false } }
    );

    // Check if admin already exists
    const existingAdmin = await User.findOne({ type: "admin" });

    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin user already exists",
        email: existingAdmin.email,
        migrationInfo: `Updated ${updateResult.modifiedCount} users with suspended field`,
      });
    }

    // Create admin user
    const adminUser = new User({
      name: "Admin",
      email: "admin@chalokchai.com",
      phone: "+880123456789",
      password: "admin123456", // This will be hashed automatically
      type: "admin",
      emailVerified: true,
      suspended: false,
    });

    await adminUser.save();

    return NextResponse.json({
      message: "Admin user created successfully",
      email: adminUser.email,
      password: "admin123456", // Return password for initial login
      migrationInfo: `Updated ${updateResult.modifiedCount} users with suspended field`,
    });
  } catch (error) {
    console.error("Admin seed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
