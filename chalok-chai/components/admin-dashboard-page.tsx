"use client"

import { Header } from "@/components/header"
import { AdminDashboardTabs } from "@/components/admin-dashboard-tabs"

export function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage platform operations and users</p>
        </div>

        <AdminDashboardTabs />
      </main>
    </div>
  )
}
