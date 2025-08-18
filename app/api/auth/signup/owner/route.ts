import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User, Owner } from "@/lib/models";
import { generateEmailVerificationToken } from "@/lib/auth";
import { sendEmailVerification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, confirmPassword } =
      await request.json();

    // Validate input
    if (!name || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken("");

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      type: "owner",
      emailVerificationToken: verificationToken,
    });

    const savedUser = await user.save();

    // Create owner profile
    const owner = new Owner({
      userId: savedUser._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: null, // Address not collected at signup
    });

    await owner.save();

    // Update verification token with actual user ID
    const actualVerificationToken = generateEmailVerificationToken(
      savedUser._id.toString()
    );
    savedUser.emailVerificationToken = actualVerificationToken;
    await savedUser.save();

    // Send verification email
    const emailResult = await sendEmailVerification(
      user.email,
      user.name,
      actualVerificationToken
    );

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
    }

    return NextResponse.json({
      message:
        "Account created successfully. Please check your email to verify your account.",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error("Owner signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
