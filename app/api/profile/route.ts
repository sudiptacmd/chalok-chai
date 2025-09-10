import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { User, Driver, Owner } from "@/lib/models";

// GET: Get current user's profile (driver or owner)
export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    let profile = null;
    if (user.type === "driver") {
      profile = await Driver.findOne({ userId: user._id });
    } else if (user.type === "owner") {
      profile = await Owner.findOne({ userId: user._id });
    }
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ user, profile });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update current user's profile (driver or owner)
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const data = await request.json();
    let profile = null;
    if (user.type === "driver") {
      await Driver.findOneAndUpdate(
        { userId: user._id },
        { $set: data },
        { new: true }
      );
      profile = await Driver.findOne({ userId: user._id });
    } else if (user.type === "owner") {
      await Owner.findOneAndUpdate(
        { userId: user._id },
        { $set: data },
        { new: true }
      );
      profile = await Owner.findOne({ userId: user._id });
    }
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    // Optionally, re-fetch the user in case any user fields were updated
    const updatedUser = await User.findOne({ email: session.user.email });
    return NextResponse.json({ user: updatedUser, profile });
  } catch (error) {
    console.error("Profile API error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
