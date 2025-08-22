import { Schema, model, models } from "mongoose";
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
  suspended: {
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
  // Profile fields
  name: { type: String, default: null },
  email: { type: String, default: null },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  // Booking and ratings
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

  // Profile fields
  name: { type: String, default: null },
  email: { type: String, default: null, required: true },
  phone: { type: String, default: null, required: true },
  dateOfBirth: { type: Date, default: null, required: true },
  nationalId: { type: String, default: null, required: true, unique: true },
  drivingLicenseNumber: { type: String, default: null, required: true, unique: true },
  drivingLicensePhoto: { type: String, default: null },
  location: { type: String, default: null, required: true },
  bio: { type: String, default: null },
  languages: { type: [String], default: [] },
  preferences: { type: [String], default: [] },
  experience: { type: String, default: null },
  pricePerDay: { type: Number, default: null },
  pricePerMonth: { type: Number, default: null },
  // Other fields

  ratings: [RatingSchema],
  averageRating: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 },
  // Availability: { date: string, status: 'unavailable' | 'booked' }
  availability: [
    {
      date: { type: String, required: true }, // YYYY-MM-DD
      status: { type: String, enum: ["unavailable", "booked"], required: true },
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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

    (acc: number, rating: { score: number }) => acc + rating.score,

    0
  );
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  return this.averageRating;
};

// Export models
export const User = models.User || model("User", UserSchema);
export const Owner = models.Owner || model("Owner", OwnerSchema);
export const Driver = models.Driver || model("Driver", DriverSchema);
