"use client"

import { useEffect, useState } from "react"
import { EnhancedDriverCard } from "@/components/enhanced-driver-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface DriverListProps {
  filters: {
    location: string
    bookingType: "daily" | "monthly"
    numberOfDays: number
    priceRange: number[]
    experience: string
    preferences: string[]
  }
}

export function DriverList({ filters }: DriverListProps) {
  interface DriverItem {
    id: string
    name: string
    photo: string | null
    rating: number
    reviewCount: number
    experience: string
    location: string
    pricePerDay: number | null
    pricePerMonth: number | null
    verified: boolean
    preferences: string[]
    bio: string
    availability: Record<string, string>
  }
  const [drivers, setDrivers] = useState<DriverItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    // Reset page when filters change
    setPage(1)
  }, [filters.location, filters.experience, filters.priceRange, filters.bookingType])

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.location) params.set("location", filters.location)
        if (filters.experience && filters.experience !== "any") params.set("experience", filters.experience)
        params.set("bookingType", filters.bookingType)
        params.set("minPrice", filters.priceRange[0].toString())
        params.set("maxPrice", filters.priceRange[1].toString())
        params.set("page", page.toString())
        const res = await fetch(`/api/drivers/search?${params.toString()}`, { signal: controller.signal })
        if (!res.ok) throw new Error("Failed to load drivers")
        const json = await res.json()
        setDrivers(json.results)
        setTotal(json.total)
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          console.error(e)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [filters.location, filters.experience, filters.priceRange, filters.bookingType, page])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{total} drivers found</h2>
      </div>

      {loading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> <span>Loading drivers...</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {drivers.map((driver) => (
            <EnhancedDriverCard key={driver.id} driver={driver} bookingType={filters.bookingType} />
        ))}
      </div>

      {!loading && drivers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No drivers found matching your criteria. Try adjusting your filters.</p>
        </div>
      )}

      <div className="flex justify-center gap-4 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="bg-transparent"
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={drivers.length === 0 || loading}
          className="bg-transparent"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
