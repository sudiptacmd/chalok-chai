import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import { Conversation } from "@/lib/models";
import { conversationHub } from "@/lib/realtime";
import mongoose from "mongoose";

// Ensure this route is always dynamic and runs on the Node.js runtime for SSE
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const fetchCache = "force-no-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  const { conversationId } = await params;
  const conv = await Conversation.findById(conversationId);
  if (!conv) return new Response("Not found", { status: 404 });
  const isParticipant = (
    conv.participants as Array<{ toString(): string } | string>
  )
    .map((p) => (typeof p === "string" ? p : p.toString()))
    .includes(session.user.id);
  if (!isParticipant) return new Response("Forbidden", { status: 403 });

  const encoder = new TextEncoder();
  let cleanupFn: (() => void) | null = null;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const send = (data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      const listener = (event: {
        type: "message";
        conversationId: string;
        messageId: string;
      }) => send(event);
      conversationHub.on(conversationId, listener);
      // Keepalive ping every 25s (under common proxy 30s idle timeout)
      const ping = setInterval(() => send({ type: "ping" }), 25000);
      controller.enqueue(encoder.encode(`retry: 1000\n\n`));
      // Send an initial comment to open the stream promptly
      controller.enqueue(encoder.encode(`: ok\n\n`));

      // Also listen via MongoDB change streams to propagate events across instances
      let changeStream: mongoose.mongo.ChangeStream | null = null;
      try {
        const coll = mongoose.connection.collection("messages");
        // Only watch inserts for this conversation
        const pipeline = [
          {
            $match: {
              operationType: "insert",
              "fullDocument.conversationId": conv._id,
            },
          },
        ];
        changeStream = coll.watch(pipeline as any, {
          fullDocument: "updateLookup",
        });
        changeStream.on("change", (change: any) => {
          const msgId = change.fullDocument?._id?.toString();
          if (msgId) {
            send({
              type: "message",
              conversationId: conv._id.toString(),
              messageId: msgId,
            });
          }
        });
      } catch (err) {
        // If change streams are not supported (e.g., standalone server), just skip silently
        console.warn("SSE change stream not enabled:", (err as Error)?.message);
      }

      // Provide cancel handler
      // In Web Streams, the cancel method will be called when client disconnects
      // The returned function from start is not used; instead implement cancel
      // but to maintain current structure, also return cleanup for environments that support it.
      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(ping);
        conversationHub.off(conversationId, listener);
        try {
          changeStream?.close();
        } catch {}
        try {
          controller.close();
        } catch {}
      };
      cleanupFn = cleanup;
      return cleanup;
    },
    cancel() {
      // Ensure cleanup if reader cancels
      try {
        cleanupFn?.();
      } catch {}
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Explicitly disable compression for proxies that might buffer
      "X-Accel-Buffering": "no",
    },
  });
}
