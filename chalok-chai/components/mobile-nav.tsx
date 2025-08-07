"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { 
  User, 
  Settings, 
  LogOut, 
  Car,
  Shield,
  BarChart3 
} from "lucide-react"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
    onClose()
  }

  const getDashboardLink = () => {
    if (!session?.user) return null
    
    switch (session.user.type) {
      case 'admin':
        return { href: '/admin', label: 'Admin Panel', icon: Shield }
      case 'driver':
        return { href: '/driver-dashboard', label: 'Driver Dashboard', icon: Car }
      case 'owner':
      default:
        return { href: '/dashboard', label: 'Dashboard', icon: BarChart3 }
    }
  }

  const dashboardInfo = getDashboardLink()
  const userInitials = session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

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

        <div className="pt-4 border-t">
          {session?.user ? (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user.profilePhoto || undefined} alt={session.user.name || ''} />
                  <AvatarFallback className="text-sm">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  <p className="text-xs text-primary capitalize">{session.user.type}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                {dashboardInfo && (
                  <Link href={dashboardInfo.href} onClick={onClose}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <dashboardInfo.icon className="h-4 w-4 mr-2" />
                      {dashboardInfo.label}
                    </Button>
                  </Link>
                )}

                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onClose}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>

                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onClose}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
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
          )}
        </div>
      </div>
    </div>
  )
}
