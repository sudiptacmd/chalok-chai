"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";

interface TicketMessage {
  senderUserId: string;
  message: string;
  createdAt: string;
}
type Priority = "low" | "medium" | "high" | "urgent";
interface Ticket {
  _id: string;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority?: Priority;
  createdAt: string;
  lastMessageAt: string;
  messages: TicketMessage[];
  createdByUserId: { _id: string; name?: string; email: string; type: string };
  againstUserId: { _id: string; name?: string; email: string; type: string };
  relatedBookingId?: {
    bookingType: string;
    status: string;
    startDate?: string;
  };
}

const MSG_MAX = 2000;

export const DisputeManagement: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [q, setQ] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  //load tickets
  const load = useCallback(async () => {
    setBooting(true);
    try {
      const qs = new URLSearchParams();
      if (statusFilter) qs.set("status", statusFilter);
      if (q.trim()) qs.set("q", q.trim());
      const res = await fetch(
        `/api/admin/tickets${qs.toString() ? `?${qs}` : ""}`
      );
      const data = await res.json();
      if (res.ok) setTickets(data.tickets || []);
    } finally {
      setBooting(false);
    }
  }, [statusFilter, q]);

  useEffect(() => {
    load();
  }, [load]);

  const active = useMemo(
    () => tickets.find((t) => t._id === activeId) ?? null,
    [tickets, activeId]
  ); //finds active tick based on activeid
  //reply
  const sendReply = async () => {
    if (!activeId || !reply.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: activeId, message: reply.trim() }),
      });
      alert("Reply sent successfully");
      const data = await res.json();
      if (res.ok) {
        setTickets((prev) =>
          prev.map((t) => (t._id === activeId ? data.ticket : t))
        );
        setReply("");
      }
    } finally {
      setLoading(false);
    }
  };

  //status
  const updateStatus = async (newStatus: Ticket["status"]) => {
    if (!activeId) return;
    setTickets((prev) =>
      prev.map((t) => (t._id === activeId ? { ...t, status: newStatus } : t))
    );
    try {
      await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: activeId, status: newStatus }),
      });
    } catch {
      load();
    }
  };

  const onComposerKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendReply();
    }
  };

  const badgeFor = (status: Ticket["status"]) => {
    const map: Record<Ticket["status"], string> = {
      open: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      closed: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
    };
    return `inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${map[status]}`;
  };
  const chipFor = (p?: Priority) => {
    const map: Record<Priority, string> = {
      low: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
      medium: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      high: "bg-orange-500/15 text-orange-300 border-orange-500/30",
      urgent: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    };
    const key: Priority = p || "medium";
    return `inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] capitalize ${map[key]}`;
  };

  const visibleTickets = useMemo(() => {
    if (!q.trim()) return tickets;
    const needle = q.toLowerCase();
    return tickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(needle) ||
        (t.priority || "").toLowerCase().includes(needle) ||
        (t.status || "").toLowerCase().includes(needle) ||
        t._id.toLowerCase().includes(needle)
    );
  }, [tickets, q]);

  return (
    <div
      className=" bg-min-h-[calc(100vh-64px)] w-full grid grid-cols-1
      md:grid-cols-[380px_1fr] lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr] gap-6"
    >
      {/* LEFT: Sidebar */}
      <aside className="md:border-r md:pr-5 md:pl-2">
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search subject, ID, priority…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") load();
            }}
            className="h-10"
          />
          <Button variant="secondary" className="h-10" onClick={load}>
            Refresh
          </Button>
        </div>

        <div className="mt-3">
          <label className="text-xs font-medium">Filter Status</label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ticket List */}
        <div className="mt-3 max-h-[calc(100vh-220px)] overflow-auto rounded-xl border">
          {booting ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-md bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : visibleTickets.length ? (
            visibleTickets.map((t) => {
              const activeRow = activeId === t._id;
              return (
                <button
                  key={t._id}
                  onClick={() => setActiveId(t._id)}
                  className={`w-full text-left px-4 py-3.5 border-b hover:bg-muted/30 transition ${
                    activeRow ? "bg-muted" : "bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate font-medium">{t.subject}</div>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className={badgeFor(t.status)}>{t.status}</span>
                        <span className={chipFor(t.priority)}>
                          {t.priority || "medium"}
                        </span>
                        <span>#{t._id.slice(-6)}</span>
                        <span className="truncate max-w-[140px]">
                          By:{" "}
                          {t.createdByUserId?.name || t.createdByUserId?.email}
                        </span>
                        <span className="truncate max-w-[140px]">
                          Vs: {t.againstUserId?.name || t.againstUserId?.email}
                        </span>
                        {t.relatedBookingId && (
                          <span className="text-blue-500/80">Trip</span>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(
                        t.lastMessageAt || t.createdAt
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No tickets found. Try another search or filter.
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT: Ticket Details */}
      <section className="flex-1 min-h-[60vh]">
        {!active && (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Select a ticket to manage.
          </div>
        )}
        {active && (
          <div className="h-full grid grid-rows-[auto_1fr_auto] gap-4">
            {/* Header */}
            <div className="rounded-xl border bg-card/60 backdrop-blur p-4 sticky top-0 z-10 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-base font-semibold mr-auto">
                  {active.subject}
                </h2>
                <Select
                  value={active.status}
                  onValueChange={(v) => updateStatus(v as Ticket["status"])}
                >
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <span className={chipFor(active.priority)}>
                  {active.priority || "medium"}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                <span>
                  <strong>Reporter:</strong>{" "}
                  {active.createdByUserId?.name ||
                    active.createdByUserId?.email}
                </span>
                <span>
                  <strong>Against:</strong>{" "}
                  {active.againstUserId?.name || active.againstUserId?.email}
                </span>
                {active.relatedBookingId && (
                  <span>
                    <strong>Trip:</strong> {active.relatedBookingId.bookingType}{" "}
                    • {active.relatedBookingId.status}{" "}
                    {active.relatedBookingId.startDate
                      ? " • " +
                        new Date(
                          active.relatedBookingId.startDate
                        ).toLocaleDateString()
                      : ""}
                  </span>
                )}
                <span>
                  <strong>Created:</strong>{" "}
                  {new Date(active.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3 overflow-auto pr-1">
              {active.messages.map((m, i) => {
                const isAdmin =
                  m.senderUserId === "admin" || m.senderUserId === "staff";
                return (
                  <div
                    key={i}
                    className={`flex ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl border p-3 text-sm shadow-sm ${
                        isAdmin
                          ? "bg-primary/10 border-primary/20"
                          : "bg-muted/40 border-border/50"
                      }`}
                    >
                      <div className="text-[11px] text-muted-foreground mb-1">
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                      <div className="whitespace-pre-wrap">{m.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <div className="rounded-xl border p-3 sticky bottom-0 bg-background/80 backdrop-blur">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Textarea
                    rows={3}
                    placeholder="Write a reply…"
                    value={reply}
                    onChange={(e) => setReply(e.target.value.slice(0, MSG_MAX))}
                    onKeyDown={onComposerKey}
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>Tip: Press Ctrl/⌘ + Enter to send</span>
                    <span>
                      {reply.length}/{MSG_MAX}
                    </span>
                  </div>
                </div>
                <Button
                  className="h-10"
                  disabled={!reply.trim() || loading}
                  onClick={sendReply}
                >
                  {loading ? "Sending…" : "Send"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default DisputeManagement;
