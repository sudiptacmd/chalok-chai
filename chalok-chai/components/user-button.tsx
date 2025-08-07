"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Car,
  Shield,
  BarChart3,
} from "lucide-react";

export function UserButton() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/signin">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">Sign Up</Button>
        </Link>
      </div>
    );
  }

  const { user } = session;
  const userInitials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const getDashboardLink = () => {
    switch (user.type) {
      case "admin":
        return { href: "/admin", label: "Admin Panel", icon: Shield };
      case "driver":
        return {
          href: "/driver-dashboard",
          label: "Driver Dashboard",
          icon: Car,
        };
      case "owner":
      default:
        return { href: "/dashboard", label: "Dashboard", icon: BarChart3 };
    }
  };

  const dashboardInfo = getDashboardLink();
  const DashboardIcon = dashboardInfo.icon;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center space-x-2 px-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user.profilePhoto || undefined}
            alt={user.name || ""}
          />
          <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {user.type}
          </span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-20">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.profilePhoto || undefined}
                    alt={user.name || ""}
                  />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-primary capitalize">{user.type}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <Link href={dashboardInfo.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <DashboardIcon className="h-4 w-4 mr-2" />
                  {dashboardInfo.label}
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>

              <div className="border-t my-2" />

              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
