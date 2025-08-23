import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb"; // default export
import { Ticket } from "@/lib/models";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = params;
  const body = await req.json();
  const { message } = body;
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });
  await dbConnect();
  const ticket = await Ticket.findById(id);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const userId = session.user.id;
  // authorization: must be creator, against, or admin
  const isParticipant =
    ticket.createdByUserId.toString() === userId ||
    ticket.againstUserId.toString() === userId;
  const isAdmin = session.user.type === "admin";
  if (!isParticipant && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  ticket.messages.push({ senderUserId: userId, message });
  ticket.unreadForAdmin = !isAdmin;
  ticket.unreadForCreator = userId !== ticket.createdByUserId.toString();
  ticket.unreadForAgainst = userId !== ticket.againstUserId.toString();
  await ticket.save();
  return NextResponse.json({ ticket });
}
