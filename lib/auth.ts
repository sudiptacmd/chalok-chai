import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

if (!JWT_SECRET) {
  throw new Error(
    "Please define the NEXTAUTH_SECRET environment variable inside .env.local"
  );
}

/**
 * Generate a JWT token
 */
export function generateToken(
  payload: object | string,
  expiresIn: string = "24h"
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): jwt.JwtPayload | string {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Generate a random token for email verification or password reset
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken(userId: string): string {
  return generateToken(
    {
      userId,
      type: "email-verification",
    },
    "24h"
  );
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(userId: string): string {
  return generateToken(
    {
      userId,
      type: "password-reset",
    },
    "1h"
  );
}

/**
 * Verify email verification token
 */
export function verifyEmailVerificationToken(token: string): {
  userId: string;
} {
  const decoded = verifyToken(token) as jwt.JwtPayload;

  if (typeof decoded === "string" || decoded.type !== "email-verification") {
    throw new Error("Invalid token type");
  }

  return { userId: decoded.userId as string };
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string): { userId: string } {
  const decoded = verifyToken(token) as jwt.JwtPayload;

  if (typeof decoded === "string" || decoded.type !== "password-reset") {
    throw new Error("Invalid token type");
  }

  return { userId: decoded.userId as string };
}
