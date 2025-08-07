"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <div className={cn("md:hidden border-t bg-background", isOpen ? "block" : "hidden")}>
      <div className="container mx-auto px-4 py-4 space-y-4">
        <nav className="flex flex-col space-y-4">
          <Link
            href="/find-driver"
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={onClose}
          >
            Find Driver
          </Link>
          <Link
            href="/become-driver"
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={onClose}
          >
            Become a Driver
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClose}>
            About
          </Link>
        </nav>

        <div className="flex flex-col space-y-2 pt-4 border-t">
          <Link href="/signin" onClick={onClose}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Sign In
            </Button>
          </Link>
          <Link href="/signup" onClick={onClose}>
            <Button size="sm" className="w-full">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
