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
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    default: null,
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
  drivingLicenseNumber: {
    type: String,
    default: null,
    required: true,
    unique: true,
  },
  drivingLicensePhoto: { type: String, default: null },
  location: { type: String, default: null, required: true },
  bio: { type: String, default: null },
  languages: { type: [String], default: [] },
  preferences: { type: [String], default: [] },
  experience: { type: String, default: null },
  pricePerDay: { type: Number, default: null },
  pricePerMonth: { type: Number, default: null },
  // Approval status (admin controlled)
  approved: { type: Boolean, default: false },
  // Other fields

  ratings: [RatingSchema],
  averageRating: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 },
  // Availability: { date: string, status: 'unavailable' | 'booked' }
  availability: [
    {
      date: { type: String, required: true }, // YYYY-MM-DD
      status: { type: String, enum: ["unavailable", "booked"], required: true },
    },
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

// Booking Schema (separate collection)
const BookingSchema = new Schema({
  driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
  ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bookingType: { type: String, enum: ["daily", "monthly"], required: true },
  // Daily booking
  selectedDates: { type: [String], default: [] }, // array of YYYY-MM-DD
  // Monthly booking
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  numberOfMonths: { type: Number, default: 0 },
  pickupLocation: { type: String, required: true },
  notes: { type: String, default: "" },
  totalCost: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
    default: "pending",
  },
  // Review and rating system
  review: {
    rating: { type: Number, min: 1, max: 5, default: null },
    comment: { type: String, trim: true, default: null },
    reviewedAt: { type: Date, default: null },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

BookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Helpful indexes for querying dashboards
BookingSchema.index({ ownerUserId: 1, createdAt: -1 });
BookingSchema.index({ driverId: 1, status: 1, createdAt: -1 });
BookingSchema.index({ status: 1, createdAt: -1 });

// Support Ticket / Dispute Schema
const TicketMessageSchema = new Schema({
  senderUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  internal: { type: Boolean, default: false }, // for admin-only notes
});

const TicketSchema = new Schema({
  createdByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  // The other participant the complaint is about (driver or owner)
  againstUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  relatedBookingId: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
  roleContext: { type: String, enum: ["owner", "driver"], required: true },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  status: { type: String, enum: ["open", "pending", "resolved", "closed"], default: "open" },
  subject: { type: String, required: true, trim: true },
  messages: [TicketMessageSchema],
  lastMessageAt: { type: Date, default: Date.now },
  unreadForAdmin: { type: Boolean, default: true },
  unreadForCreator: { type: Boolean, default: false },
  unreadForAgainst: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TicketSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (this.messages?.length) {
    this.lastMessageAt = this.messages[this.messages.length - 1].createdAt;
  }
  next();
});

TicketSchema.index({ createdByUserId: 1, lastMessageAt: -1 });
TicketSchema.index({ againstUserId: 1, lastMessageAt: -1 });
TicketSchema.index({ status: 1, lastMessageAt: -1 });

// Export all models
export const User = models.User || model("User", UserSchema);
export const Owner = models.Owner || model("Owner", OwnerSchema);
export const Driver = models.Driver || model("Driver", DriverSchema);
export const Booking = models.Booking || model("Booking", BookingSchema);
export const Ticket = models.Ticket || model("Ticket", TicketSchema);

