"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, User, UserCheck } from "lucide-react"
import { CarOwnerSignUp } from "@/components/car-owner-signup"
import { DriverSignUp } from "@/components/driver-signup"

type UserType = "car-owner" | "driver" | null

export function SignUpPage() {
  const [userType, setUserType] = useState<UserType>(null)

  if (userType === "car-owner") {
    return <CarOwnerSignUp onBack={() => setUserType(null)} />
  }

  if (userType === "driver") {
    return <DriverSignUp onBack={() => setUserType(null)} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ChalokChai</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join ChalokChai</CardTitle>
            <CardDescription>Choose how you want to use our platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-20 flex-col space-y-2 bg-transparent"
              onClick={() => setUserType("car-owner")}
            >
              <User className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">I need a driver</div>
                <div className="text-xs text-muted-foreground">Car Owner</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-20 flex-col space-y-2 bg-transparent"
              onClick={() => setUserType("driver")}
            >
              <UserCheck className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">I want to drive</div>
                <div className="text-xs text-muted-foreground">Professional Driver</div>
              </div>
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
