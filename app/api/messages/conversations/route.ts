import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Conversation, User } from "@/lib/models";

// GET: list conversations for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const list = await Conversation.find({ participants: session.user.id })
      .sort({ latestMessageAt: -1 })
      .populate({ path: "participants", select: "name email profilePhoto" });
    return NextResponse.json({ conversations: list });
  } catch (e) {
    console.error("List conversations error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: ensure or create conversation with other user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const { otherUserId } = await req.json();
    if (!otherUserId) return NextResponse.json({ error: "otherUserId required" }, { status: 400 });
    if (otherUserId === session.user.id) return NextResponse.json({ error: "Cannot create conversation with self" }, { status: 400 });

    const other = await User.findById(otherUserId);
    if (!other) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const participants = [session.user.id, otherUserId].map((id) => id.toString()).sort();
    // Find existing conversation with same two participants (order-independent)
    let conv = await Conversation.findOne({ participants: { $all: participants, $size: 2 } });
    if (!conv) {
      conv = await Conversation.create({ participants, lastMessage: "", latestMessageAt: new Date() });
    }
    return NextResponse.json({ conversationId: conv._id.toString() });
  } catch (e) {
    console.error("Create conversation error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
