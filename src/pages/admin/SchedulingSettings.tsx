/**
 * SchedulingSettings (admin)
 *
 * Single page for managing the practice's scheduling infrastructure:
 *   - Rooms: activate/deactivate, edit capacity, edit allowed service lines
 *   - Blackouts: mark a specific room unavailable for a window
 *   - Booking limits: cap simultaneous appointments per service line / room type
 *
 * Access: admin / provider roles only (enforced by RLS).
 *
 * Route this in your router at /admin/scheduling (or wherever admin routes live).
 */

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { RoomList } from "@/components/admin/scheduling/RoomList";
import { RoomBlackouts } from "@/components/admin/scheduling/RoomBlackouts";
import { BookingLimitsTable } from "@/components/admin/scheduling/BookingLimitsTable";

type Tab = "rooms" | "blackouts" | "limits";

const TABS: { key: Tab; label: string; description: string }[] = [
  { key: "rooms", label: "Rooms", description: "The 5 spaces patients can be booked into" },
  { key: "blackouts", label: "Blackouts", description: "Mark a room unavailable for a window of time" },
  { key: "limits", label: "Booking Limits", description: "Concurrent caps per service line" },
];

export default function SchedulingSettings() {
  const [tab, setTab] = useState<Tab>("rooms");

  return (
    <>
      <Helmet>
        <title>Scheduling Settings · Elevated Health</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-6 lg:px-8 py-8 max-w-6xl">
            <p className="font-jost text-xs uppercase tracking-[0.18em] text-accent mb-2">Practice Settings</p>
            <h1 className="font-playfair text-3xl md:text-4xl text-foreground">Scheduling</h1>
            <p className="font-jost text-sm text-muted-foreground mt-2 max-w-2xl">
              Manage the four treatment rooms and lobby flex space, set blackouts, and concurrent caps.
              Appointment durations are set per booking, not here.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <nav className="flex flex-wrap gap-0 border-b border-border mt-6 -mb-px">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={[
                    "px-5 py-3 font-jost text-sm border-b-2 transition-colors",
                    active
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>

          <div className="py-8">
            <div className="mb-6">
              <p className="font-jost text-sm text-muted-foreground">
                {TABS.find((t) => t.key === tab)?.description}
              </p>
            </div>

            {tab === "rooms" && <RoomList />}
            {tab === "blackouts" && <RoomBlackouts />}
            {tab === "limits" && <BookingLimitsTable />}
          </div>
        </div>
      </div>
    </>
  );
}
