"use client"

import { Header } from "@/components/header"
import { UserDashboardTabs } from "@/components/user-dashboard-tabs"

export function UserDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your account and bookings</p>
        </div>

        <UserDashboardTabs />
      </main>
    </div>
  )
}
