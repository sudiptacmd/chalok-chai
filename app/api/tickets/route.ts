import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Booking, Ticket, User, Driver } from "@/lib/models";

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
  const filter: any = {};
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
      select: "bookingType selectedDates startDate endDate status totalCost driverId ownerUserId",
      populate: [
        { path: "ownerUserId", select: "name email" },
        { path: "driverId", populate: { path: "userId", select: "name email" } },
      ],
    })
    .sort({ lastMessageAt: -1 })
    .lean();
  return NextResponse.json({ tickets });
}

// POST /api/tickets - create ticket
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { againstUserId, relatedBookingId, subject, message, priority } = body;
    if (!againstUserId || !subject || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await dbConnect();
    const creatorId = session.user.id;
    const creatorUser = await User.findById(creatorId);
    if (!creatorUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Resolve driver documents (a Driver references a User via userId)
    const driverCreator = await Driver.findOne({ userId: creatorId });
    const driverAgainst = await Driver.findOne({ userId: againstUserId });

  let booking: any = null;
    if (relatedBookingId) {
      try {
        booking = await Booking.findById(relatedBookingId).populate({
          path: "driverId",
          select: "userId",
        });
      } catch (e: any) {
        if (e?.name === "CastError") {
          return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
        }
        throw e;
      }
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 400 });
      }
      // Relaxed: we no longer strictly validate both users are participants to avoid false negatives.
    } else {
      // Attempt to locate any accepted/completed booking between the two parties.
      // We must use Driver document _id for driverId field, not user _id.
      const or: any[] = [];
      if (driverAgainst) {
        // creator (owner) vs against (driver)
        or.push({ ownerUserId: creatorId, driverId: driverAgainst._id });
      }
      if (driverCreator) {
        // creator (driver) vs against (owner)
        or.push({ ownerUserId: againstUserId, driverId: driverCreator._id });
      }
      if (or.length) {
        booking = await Booking.findOne({
          $or: or,
          status: { $in: ["accepted", "completed"] },
        });
      }
      // If none found, we now permit ticket creation WITHOUT a booking link (booking stays null)
    }

    let backfilled = false;
    function genId() {
      return (
        "TKT-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).slice(2, 6).toUpperCase()
      );
    }
    async function backfillNullIdsOnce() {
      if (backfilled) return; // only once per request
      backfilled = true;
      const legacy = await Ticket.find({
        $or: [
          { ticketId: { $exists: false } },
          { ticketId: null },
        ],
      })
        .select("_id ticketId")
        .lean();
      if (!legacy.length) return;
      // Drop existing index to avoid uniqueness conflicts on multiple nulls
      try { await (Ticket as any).collection.dropIndex("ticketId_1"); } catch (_) {}
      // Assign unique ids per document
      const ops = legacy.map((d) => ({
        updateOne: {
          filter: { _id: d._id },
          update: { $set: { ticketId: genId() } },
        },
      }));
      if (ops.length) {
        await Ticket.bulkWrite(ops, { ordered: false }).catch(() => {});
      }
      // Recreate index (unique + sparse)
      try {
        await (Ticket as any).collection.createIndex({ ticketId: 1 }, { unique: true, sparse: true });
      } catch (e) {
        // ignore
      }
    }
    await backfillNullIdsOnce();

    async function createWithRetry(attempt = 0): Promise<any> {
      try {
        return await Ticket.create({
          ticketId: genId(),
          createdByUserId: creatorId,
          againstUserId,
          relatedBookingId: booking?._id || null,
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
      } catch (e: any) {
        if (e?.code === 11000 && attempt < 3) {
      // slight delay to reduce collision probability
      await new Promise(r => setTimeout(r, 10));
          // attempt backfill again in case race condition
          await backfillNullIdsOnce();
          return await createWithRetry(attempt + 1);
        }
        throw e;
      }
    }
    const ticket = await createWithRetry();
    return NextResponse.json({ ticket });
  } catch (err: any) {
    console.error("Ticket POST error", err?.message, err?.stack);
    const msg = err?.message || "Server error creating ticket";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
