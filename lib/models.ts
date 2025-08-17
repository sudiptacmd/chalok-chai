import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

// Rating Schema for embedded ratings
const RatingSchema = new Schema({
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// User Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  type: {
    type: String,
    required: true,
    enum: ["owner", "driver", "admin"],
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Owner Schema
const OwnerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  bookingHistory: [
    {
      driverId: {
        type: Schema.Types.ObjectId,
        ref: "Driver",
      },
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled"],
        default: "pending",
      },
      amount: Number,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  ratings: [RatingSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Driver Schema
const DriverSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  nationalId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  drivingLicenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  drivingLicensePhoto: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
    default: "",
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  // Pricing & commercial fields
  pricePerDay: {
    type: Number,
    default: 0,
    min: 0,
  },
  pricePerMonth: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Years of professional driving experience
  experienceYears: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Driver self-declared or platform tagged preferences (e.g., Non-smoker, English speaking)
  preferences: {
    type: [String],
    default: [],
  },
  // Languages the driver can communicate in
  languages: {
    type: [String],
    default: [],
  },
  // Vehicle types the driver is comfortable with
  vehicleTypes: {
    type: [String],
    default: [],
  },
  // Availability calendar entries (denormalized for quick lookups)
  availability: {
    type: [
      new Schema(
        {
          date: { type: Date, required: true },
          status: {
            type: String,
            enum: ["available", "booked", "unavailable"],
            default: "available",
          },
        },
        { _id: false }
      ),
    ],
    default: [],
  },
  approved: {
    type: Boolean,
    default: false,
  },
  ratings: [RatingSchema],
  averageRating: {
    type: Number,
    default: 0,
  },
  totalRides: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update the updatedAt field before saving
UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

OwnerSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

DriverSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Calculate average rating for drivers
DriverSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return 0;
  }

  const sum = this.ratings.reduce(
    (acc: number, rating: { score: number }) => acc + (rating?.score || 0),
    0
  );
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  return this.averageRating;
};

// Export models
export const User = models.User || model("User", UserSchema);
export const Owner = models.Owner || model("Owner", OwnerSchema);
export const Driver = models.Driver || model("Driver", DriverSchema);
