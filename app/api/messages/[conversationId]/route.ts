import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Conversation, Message } from "@/lib/models";
import { conversationHub } from "@/lib/realtime";

// GET: list messages in a conversation (auth must be participant)
export async function GET(_req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const conv = await Conversation.findById(params.conversationId);
    if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    const isParticipant = (conv.participants as Array<{ toString(): string } | string>)
      .map((p) => (typeof p === "string" ? p : p.toString()))
      .includes(session.user.id);
    if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const messages = await Message.find({ conversationId: conv._id }).sort({ createdAt: 1 });
    return NextResponse.json({ messages });
  } catch (e) {
    console.error("List messages error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: send a new message in the conversation
export async function POST(req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const conv = await Conversation.findById(params.conversationId);
    if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    const participants = (conv.participants as Array<{ toString(): string } | string>)
      .map((p) => (typeof p === "string" ? p : p.toString()));
    if (!participants.includes(session.user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { body } = await req.json();
    if (!body || typeof body !== "string" || !body.trim()) {
      return NextResponse.json({ error: "Message body required" }, { status: 400 });
    }
    const [a, b] = participants;
    const recipientId = a === session.user.id ? b : a;
    const message = await Message.create({
      conversationId: conv._id,
      senderId: session.user.id,
      recipientId,
      body: body.trim(),
    });
    conv.lastMessage = body.trim();
    conv.latestMessageAt = new Date();
    await conv.save();

    // Emit realtime event
    conversationHub.emit({ type: "message", conversationId: conv._id.toString(), messageId: message._id.toString() });

    return NextResponse.json({ success: true, message });
  } catch (e) {
    console.error("Send message error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
