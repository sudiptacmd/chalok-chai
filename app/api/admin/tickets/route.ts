import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Ticket, Booking, Driver, User } from "@/lib/models";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.type !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const filter: any = {};
  if (status) filter.status = status;
  const tickets = await Ticket.find(filter)
    .populate("createdByUserId", "name email type")
    .populate("againstUserId", "name email type")
    .populate({
      path: "relatedBookingId",
      select: "bookingType selectedDates startDate endDate status totalCost driverId ownerUserId pickupLocation",
      populate: [
        { path: "ownerUserId", select: "name email" },
        { path: "driverId", populate: { path: "userId", select: "name email" } },
      ],
    })
    .sort({ lastMessageAt: -1 })
    .lean();
  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  // Admin reply or status change
  const session = await getServerSession(authOptions);
  if (session?.user?.type !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { ticketId, message, status } = body;
  if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 });
  await dbConnect();
  const ticket = await Ticket.findById(ticketId)
    .populate("createdByUserId", "name email type")
    .populate("againstUserId", "name email type")
    .populate({
      path: "relatedBookingId",
      select: "bookingType selectedDates startDate endDate status totalCost driverId ownerUserId pickupLocation",
      populate: [
        { path: "ownerUserId", select: "name email" },
        { path: "driverId", populate: { path: "userId", select: "name email" } },
      ],
    });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (message) {
    ticket.messages.push({ senderUserId: session.user.id, message });
    ticket.unreadForCreator = true;
    ticket.unreadForAgainst = true;
  }
  if (status) ticket.status = status;
  await ticket.save();
  return NextResponse.json({ ticket });
}
