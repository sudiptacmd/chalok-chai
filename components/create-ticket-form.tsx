"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CounterpartUser { _id: string; name?: string; email: string; type: string }
interface BookingOption { id: string; type: string; status: string; startDate?: string; endDate?: string; selectedDates?: string[]; ownerUserId: string; driverUserId: string }
interface Props { onCreated?: (ticket: any) => void }

const SUBJECT_MAX = 120;
const MESSAGE_MAX = 1500;

export const CreateTicketForm: React.FC<Props> = ({ onCreated }) => {
  useSession(); // client-side gate if needed

  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<CounterpartUser[]>([]);
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [priority, setPriority] = useState<"low"|"medium"|"high"|"urgent">("medium");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tickets/context");
        if (!res.ok) return;
        const data = await res.json();
        setUsers(data.users || []);
        setBookings(data.bookings || []);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const userFilteredBookings = useMemo(() => {
    if (!selectedUserId) return bookings;
    return bookings.filter(
      b => b.ownerUserId === selectedUserId || b.driverUserId === selectedUserId
    );
  }, [bookings, selectedUserId]);

  const validate = () => {
    if (!selectedUserId) return "Please select the user involved.";
    if (!subject.trim()) return "Subject is required.";
    if (!message.trim()) return "Message is required.";
    if (subject.length > SUBJECT_MAX) return `Subject must be ≤ ${SUBJECT_MAX} chars.`;
    if (message.length > MESSAGE_MAX) return `Message must be ≤ ${MESSAGE_MAX} chars.`;
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null); setSuccess(null);

    const v = validate();
    if (v) { setError(v); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          againstUserId: selectedUserId,
          relatedBookingId: selectedBookingId || undefined,
          subject: subject.trim(),
          message: message.trim(),
          priority,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create ticket");

      setSuccess("Ticket created");
      setSubject("");
      setMessage("");
      setSelectedUserId("");
      setSelectedBookingId("");
      setPriority("medium");
      onCreated?.(data.ticket);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ctrl/⌘ + Enter to submit
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="w-full">
      <div
        className="
          mx-auto w-full max-w-2xl
          rounded-2xl border border-border/50 bg-card/60
          shadow-lg backdrop-blur p-6 md:p-8
        "
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Help &amp; Support</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a ticket for booking issues, payments, or disputes. Our team will follow up.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50/70 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} onKeyDown={onKeyDown}>
          {/* Subject */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Subject<span className="text-red-500"> *</span></label>
              <span className="text-xs text-muted-foreground">{subject.length}/{SUBJECT_MAX}</span>
            </div>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value.slice(0, SUBJECT_MAX))}
              placeholder="Briefly describe the issue"
              required
            />
          </div>

          {/* Row: user + priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">User Involved<span className="text-red-500"> *</span></label>
              <Select
                value={selectedUserId}
                onValueChange={(v) => { setSelectedUserId(v); if (selectedBookingId) setSelectedBookingId(""); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No users found</div>
                  )}
                  {users.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name || u.email} ({u.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">Pick the customer/driver tied to this issue.</p>
            </div>

            <div>
              <label className="block text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Urgent is for safety, fraud, or live booking incidents.
              </p>
            </div>
          </div>

          {/* Booking */}
          <div>
            <label className="block text-sm font-medium">Related Trip (optional)</label>
            <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Link a specific trip (if any)" />
              </SelectTrigger>
              <SelectContent>
                {userFilteredBookings.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No trips for this user</div>
                )}
                {userFilteredBookings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.type} • {b.status}
                    {b.selectedDates?.length ? ` • ${b.selectedDates.length} day(s)` : ""}
                    {b.startDate ? ` • ${new Date(b.startDate).toLocaleDateString()}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Message<span className="text-red-500"> *</span></label>
              <span className="text-xs text-muted-foreground">{message.length}/{MESSAGE_MAX}</span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
              required
              rows={6}
              placeholder="Explain what happened, expected vs actual, steps, screenshots/IDs…"
            />
            <p className="mt-1 text-xs text-muted-foreground">Tip: Press <kbd className="px-1 py-0.5 border rounded">Ctrl</kbd>/<kbd className="px-1 py-0.5 border rounded">⌘</kbd> + <kbd className="px-1 py-0.5 border rounded">Enter</kbd> to submit.</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Ticket"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSubject(""); setMessage("");
                setSelectedUserId(""); setSelectedBookingId("");
                setPriority("medium");
                setError(null); setSuccess(null);
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketForm;
