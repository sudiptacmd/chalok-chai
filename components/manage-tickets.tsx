"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea"; // ensure exists
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { RefreshCcw, Search, ArrowUpDown } from "lucide-react";

interface TicketMessage {
  _id?: string;
  senderUserId: string;
  message: string;
  createdAt: string;
}
interface Ticket {
  _id: string;
  subject: string;
  status: string;
  priority?: string;
  relatedBookingId?: {
    _id: string;
    bookingType: string;
    status: string;
    startDate?: string;
    endDate?: string;
    selectedDates?: string[];
    totalCost?: number;
  } | null;
  messages: TicketMessage[];
  createdByUserId: string;
  againstUserId: string;
  lastMessageAt: string;
}

export const ManageTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "oldest" | "priority">("recent");
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/tickets?scope=involved", {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) setTickets(data.tickets);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    // auto refresh every 45s
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(() => load(), 45000);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [load]);

  const sendReply = async (ticketId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      const data = await res.json();
      if (res.ok) {
        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? data.ticket : t))
        );
        setReply("");
      }
    } finally {
      setLoading(false);
    }
  };

  const active = tickets.find((t) => t._id === activeId);

  const markRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/tickets/${id}/read`, { method: "POST" });
    } catch {}
  }, []);

  useEffect(() => {
    if (activeId) markRead(activeId);
  }, [activeId, markRead]);

  const filtered = useMemo(() => {
    let list = [...tickets];
    if (filterStatus !== "all")
      list = list.filter((t) => t.status === filterStatus);
    if (filterPriority !== "all")
      list = list.filter((t) => (t.priority || "medium") === filterPriority);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.messages.some((m) => m.message.toLowerCase().includes(q))
      );
    }
    if (sort === "recent") {
      list.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      );
    } else if (sort === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.lastMessageAt).getTime() -
          new Date(b.lastMessageAt).getTime()
      );
    } else if (sort === "priority") {
      const order: Record<string, number> = {
        urgent: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      list.sort(
        (a, b) =>
          (order[a.priority || "medium"] ?? 5) -
          (order[b.priority || "medium"] ?? 5)
      );
    }
    return list;
  }, [tickets, filterStatus, filterPriority, search, sort]);

  const priorityBadgeColor = (p?: string) => {
    switch (p) {
      case "urgent":
        return "bg-red-600/20 text-red-700";
      case "high":
        return "bg-orange-500/20 text-orange-600";
      case "low":
        return "bg-gray-400/20 text-gray-600";
      default:
        return "bg-yellow-500/20 text-yellow-600";
    }
  };

  return (
    <div className="flex gap-6">
      <div className="w-80 space-y-3 border-r pr-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 h-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={load}
            disabled={refreshing}
            className="h-9 w-9"
          >
            <RefreshCcw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(v: "recent" | "oldest" | "priority") => setSort(v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-auto pr-1">
          {filtered.map((t) => (
            <button
              key={t._id}
              onClick={() => setActiveId(t._id)}
              className={`group relative block w-full text-left px-3 py-2 rounded border transition ${
                activeId === t._id
                  ? "bg-accent/40 border-accent"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs mb-0.5">
                <span className="font-medium truncate max-w-[150px]">
                  {t.subject}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded capitalize text-[10px] ${priorityBadgeColor(
                    t.priority
                  )}`}
                >
                  {t.priority || "medium"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="uppercase tracking-wide">{t.status}</span>
                <span>{new Date(t.lastMessageAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
          {!filtered.length && (
            <p className="text-xs text-muted-foreground px-1">
              No tickets found.
            </p>
          )}
        </div>
      </div>
      <div className="flex-1">
        {!active && (
          <p className="text-sm text-muted-foreground">Select a ticket</p>
        )}
        {active && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-semibold">{active.subject}</span>
              <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs capitalize">
                {active.priority}
              </span>
              {active.relatedBookingId && (
                <span className="text-xs text-muted-foreground">
                  Trip: {active.relatedBookingId.bookingType} •{" "}
                  {active.relatedBookingId.status}{" "}
                  {active.relatedBookingId.startDate
                    ? "• " +
                      new Date(
                        active.relatedBookingId.startDate
                      ).toLocaleDateString()
                    : ""}
                </span>
              )}
              <span className="text-xs uppercase tracking-wide">
                {active.status}
              </span>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => activeId && load()}
                className="h-8 text-xs gap-1"
              >
                <ArrowUpDown className="h-3 w-3" /> Refresh
              </Button>
            </div>
            {active.messages.map((m, idx) => (
              <div key={idx} className="p-3 border rounded">
                <div className="text-[11px] text-muted-foreground mb-1">
                  {new Date(m.createdAt).toLocaleString()}
                </div>
                <div className="text-sm whitespace-pre-wrap">{m.message}</div>
              </div>
            ))}
            <div className="space-y-2">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Type your reply..."
              />
              <Button
                disabled={loading || !reply.trim()}
                onClick={() => activeId && sendReply(activeId)}
              >
                {loading ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTickets;
