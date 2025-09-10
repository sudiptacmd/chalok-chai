"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

type Msg = {
  _id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
};

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // Get the id from params
  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!id) return;
    let abort = false;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/messages/${id}`);
      if (!res.ok) {
        router.push("/messages");
        return;
      }
      const json = await res.json();
      if (!abort) setMessages(json.messages || []);
      setLoading(false);
      setTimeout(scrollToBottom, 50);
    })();
    return () => {
      abort = true;
    };
  }, [id, router]);

  useEffect(() => {
    const es = new EventSource(`/api/messages/${id}/stream`);
    es.onmessage = async (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "message") {
          // refetch newest message for simplicity
          const res = await fetch(`/api/messages/${id}`);
          if (res.ok) {
            const json = await res.json();
            setMessages(json.messages || []);
            setTimeout(scrollToBottom, 50);
          }
        }
      } catch {}
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, [id]);

  const send = async () => {
    const body = input.trim();
    if (!body) return;
    setInput("");
    const res = await fetch(`/api/messages/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      // restore? keep simple
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1 flex">
        <Card className="w-full flex flex-col">
          <CardContent className="p-0 flex flex-col h-[70vh]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {loading && (
                <p className="text-sm text-muted-foreground">
                  Loading messages...
                </p>
              )}
              {!loading && messages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No messages yet. Say hello!
                </p>
              )}
              {messages.map((m) => {
                const mine = m.senderId === session?.user?.id;
                return (
                  <div
                    key={m._id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`${
                        mine
                          ? "bg-primary text-primary-foreground"
                          : "bg-white text-black"
                      } max-w-[70%] px-3 py-2 rounded-lg shadow-sm border ${
                        mine ? "" : "border-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {m.body}
                      </p>
                      <p className="text-[10px] opacity-80 mt-1 text-right">
                        {new Date(m.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="border-t p-3 flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <Button onClick={send}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
