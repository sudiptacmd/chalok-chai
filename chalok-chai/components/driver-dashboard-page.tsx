"use client"

import { Header } from "@/components/header"
import { DriverDashboardTabs } from "@/components/driver-dashboard-tabs"

export function DriverDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
          <p className="text-muted-foreground">Manage your driving services and bookings</p>
        </div>

        <DriverDashboardTabs />
      </main>
    </div>
  )
}
