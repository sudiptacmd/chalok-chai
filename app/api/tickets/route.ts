import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Booking, Ticket, User } from "@/lib/models";

// GET /api/tickets?scope=mine|involved
// Returns tickets created by the user or where user is againstUser
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "mine";
  const filter: Record<string, unknown> = {};
  if (scope === "involved") {
    filter.$or = [
      { createdByUserId: session.user.id },
      { againstUserId: session.user.id },
    ];
  } else {
    filter.createdByUserId = session.user.id;
  }
  const tickets = await Ticket.find(filter)
    .populate("createdByUserId", "name email type")
    .populate("againstUserId", "name email type")
    .populate({
      path: "relatedBookingId",
      select:
        "bookingType selectedDates startDate endDate status totalCost driverId ownerUserId",
      populate: [
        { path: "ownerUserId", select: "name email" },
        {
          path: "driverId",
          populate: { path: "userId", select: "name email" },
        },
      ],
    })
    .sort({ lastMessageAt: -1 })
    .lean();
  return NextResponse.json({ tickets });
}

// POST /api/tickets - create ticket
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { againstUserId, relatedBookingId, subject, message, priority } = body;
  if (!againstUserId || !subject || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  await dbConnect();
  const creatorId = session.user.id;
  const creatorUser = await User.findById(creatorId);
  if (!creatorUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  let booking = null;
  if (relatedBookingId) {
    booking = await Booking.findById(relatedBookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 400 });
    }
    // ensure booking connects the two users
    // booking.driverId references Driver, need its userId indirectly; skip deep validation for now
  } else {
    // find any accepted/completed booking between users
    booking = await Booking.findOne({
      $or: [
        { ownerUserId: creatorId, driverId: againstUserId },
        { ownerUserId: againstUserId, driverId: creatorId },
      ],
      status: { $in: ["accepted", "completed"] },
    });
  }
  if (!booking) {
    return NextResponse.json(
      { error: "No qualifying booking between users" },
      { status: 400 }
    );
  }
  const ticket = await Ticket.create({
    createdByUserId: creatorId,
    againstUserId,
    relatedBookingId: booking._id,
    roleContext: creatorUser.type === "driver" ? "driver" : "owner",
    subject,
    priority: priority || "medium",
    messages: [
      {
        senderUserId: creatorId,
        message,
      },
    ],
  });
  return NextResponse.json({ ticket });
}
