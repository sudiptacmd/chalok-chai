import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";
import { verifyEmailVerificationToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/signin?error=Invalid verification link", request.url)
      );
    }

    try {
      const { userId } = verifyEmailVerificationToken(token);

      await dbConnect();

      const user = await User.findById(userId);

      if (!user) {
        return NextResponse.redirect(
          new URL("/signin?error=User not found", request.url)
        );
      }

      if (user.emailVerified) {
        return NextResponse.redirect(
          new URL("/signin?message=Email already verified", request.url)
        );
      }

      // Verify email
      user.emailVerified = true;
      user.emailVerificationToken = null;
      await user.save();

      // Redirect based on user type
      if (user.type === "driver") {
        return NextResponse.redirect(
          new URL(
            "/signin?message=Email verified successfully. Your account is pending admin approval.",
            request.url
          )
        );
      } else {
        return NextResponse.redirect(
          new URL(
            "/signin?message=Email verified successfully. You can now sign in.",
            request.url
          )
        );
      }
    } catch (tokenError) {
      console.error("Token verification error:", tokenError);
      return NextResponse.redirect(
        new URL(
          "/signin?error=Invalid or expired verification link",
          request.url
        )
      );
    }
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/signin?error=Verification failed", request.url)
    );
  }
}
