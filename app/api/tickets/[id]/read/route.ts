import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Ticket } from "@/lib/models";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const ticket = await Ticket.findById(params.id);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const uid = session.user.id;
  const isAdmin = session.user.type === "admin";
  if (isAdmin) {
    ticket.unreadForAdmin = false;
  } else if (ticket.createdByUserId.toString() === uid) {
    ticket.unreadForCreator = false;
  } else if (ticket.againstUserId.toString() === uid) {
    ticket.unreadForAgainst = false;
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await ticket.save();
  return NextResponse.json({ success: true });
}