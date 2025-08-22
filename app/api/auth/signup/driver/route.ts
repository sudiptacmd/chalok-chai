import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User, Driver } from "@/lib/models";
import { generateEmailVerificationToken } from "@/lib/auth";
import { sendEmailVerification } from "@/lib/email";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const nationalId = formData.get("nationalId") as string;
  const drivingLicenseNumber = formData.get("drivingLicenseNumber") as string;
  const location = formData.get("location") as string;
  const bio = formData.get("bio") as string;
  const experience = formData.get("experience") as string | null;
  const pricePerDay = formData.get("pricePerDay") as string | null;
  const pricePerMonth = formData.get("pricePerMonth") as string | null;
  const languages = formData.getAll("languages") as string[] | null;
  const preferences = formData.getAll("preferences") as string[] | null;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const profilePhoto = formData.get("profilePhoto") as File | null;
  const drivingLicensePhoto = formData.get("drivingLicensePhoto") as File | null;

    // Validate input
    if (
      !name ||
      !email ||
      !phone ||
      !dateOfBirth ||
      !nationalId ||
      !drivingLicenseNumber ||
      !location ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
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

    // Validate date of birth (must be at least 18 years old)
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (
      age < 18 ||
      (age === 18 && monthDiff < 0) ||
      (age === 18 && monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      return NextResponse.json(
        { error: "You must be at least 18 years old to register as a driver" },
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

    // Check if national ID or license number already exists
    const existingDriver = await Driver.findOne({
      $or: [
        { nationalId: nationalId.trim() },
        { drivingLicenseNumber: drivingLicenseNumber.trim() },
      ],
    });

    if (existingDriver) {
      return NextResponse.json(
        { error: "National ID or Driving License number already registered" },
        { status: 409 }
      );
    }

    let profilePhotoUrl = null;
    let drivingLicensePhotoUrl = null;

    // Upload profile photo if provided
    if (profilePhoto && profilePhoto.size > 0) {
      const profilePhotoBuffer = Buffer.from(await profilePhoto.arrayBuffer());
      const profileUploadResult = await uploadImageToCloudinary(
        profilePhotoBuffer,
        "chalok-chai/profiles",
        { width: 400, height: 400, quality: 80 }
      );

      if (profileUploadResult.success) {
        profilePhotoUrl = profileUploadResult.url;
      } else {
        return NextResponse.json(
          { error: "Failed to upload profile photo" },
          { status: 400 }
        );
      }
    }

    // Upload driving license photo if provided
    if (drivingLicensePhoto && drivingLicensePhoto.size > 0) {
      const licensePhotoBuffer = Buffer.from(
        await drivingLicensePhoto.arrayBuffer()
      );
      const licenseUploadResult = await uploadImageToCloudinary(
        licensePhotoBuffer,
        "chalok-chai/licenses",
        { width: 800, height: 600, quality: 85 }
      );

      if (licenseUploadResult.success) {
        drivingLicensePhotoUrl = licenseUploadResult.url;
      } else {
        return NextResponse.json(
          { error: "Failed to upload driving license photo" },
          { status: 400 }
        );
      }
    }

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken("");

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      type: "driver",
      emailVerificationToken: verificationToken,
      profilePhoto: profilePhotoUrl,
    });

    const savedUser = await user.save();

    // Create driver profile
    const driver = new Driver({
      userId: savedUser._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      dateOfBirth: dob,
      nationalId: nationalId.trim(),
      drivingLicenseNumber: drivingLicenseNumber.trim(),
      drivingLicensePhoto: drivingLicensePhotoUrl,
      location: location.trim(),
      bio: bio?.trim() || null,
      experience: experience || null,
      pricePerDay: pricePerDay ? Number(pricePerDay) : null,
      pricePerMonth: pricePerMonth ? Number(pricePerMonth) : null,
      languages: languages && languages.length > 0 ? languages : [],
      preferences: preferences && preferences.length > 0 ? preferences : [],
      approved: false, // Requires admin approval
    });

    await driver.save();

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
        "Driver account created successfully. Please check your email to verify your account. Your account will be reviewed by an administrator.",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error("Driver signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
