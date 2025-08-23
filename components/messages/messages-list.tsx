"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

type Conversation = {
  _id: string;
  participants: Array<{ _id: string; name?: string }>;
  lastMessage?: string;
  latestMessageAt?: string;
};

export function MessagesList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const json = await res.json();
        setConversations(json.conversations || []);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!loading && conversations.length === 0 && (
          <p className="text-sm text-muted-foreground">No conversations yet.</p>
        )}
        <div className="divide-y">
          {conversations.map((c) => {
            const me = session?.user?.id;
            const other = c.participants.find((p) => p._id !== me) || c.participants[0];
            return (
              <Link key={c._id} href={`/messages/${c._id}`} className="block py-3 hover:bg-muted/40 px-2 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{other?.name || "User"}</p>
                    {c.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate max-w-[60ch]">{c.lastMessage}</p>
                    )}
                  </div>
                  {c.latestMessageAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.latestMessageAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
