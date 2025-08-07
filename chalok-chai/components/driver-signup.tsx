"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, ArrowLeft, Upload, AlertCircle, CheckCircle } from "lucide-react";

interface DriverSignUpProps {
  onBack: () => void;
}

export function DriverSignUp({ onBack }: DriverSignUpProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationalId: "",
    drivingLicenseNumber: "",
    bio: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [drivingLicensePhoto, setDrivingLicensePhoto] = useState<File | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "license"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "profile") {
        setProfilePhoto(file);
      } else {
        setDrivingLicensePhoto(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const submitFormData = new FormData();

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value);
      });

      // Append files if selected
      if (profilePhoto) {
        submitFormData.append("profilePhoto", profilePhoto);
      }
      if (drivingLicensePhoto) {
        submitFormData.append("drivingLicensePhoto", drivingLicensePhoto);
      }

      const response = await fetch("/api/auth/signup/driver", {
        method: "POST",
        body: submitFormData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/signin");
        }, 4000);
      } else {
        setError(data.error || "An error occurred during signup");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">ChalokChai</span>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Application Submitted!</CardTitle>
              <CardDescription>
                Your driver application has been submitted for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">{message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ChalokChai</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-xl">Driver Registration</CardTitle>
                <CardDescription>Join as a professional driver</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 p-4 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input
                  id="nationalId"
                  type="text"
                  placeholder="Enter your National ID"
                  value={formData.nationalId}
                  onChange={(e) =>
                    setFormData({ ...formData, nationalId: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drivingLicenseNumber">
                  Driving License Number
                </Label>
                <Input
                  id="drivingLicenseNumber"
                  type="text"
                  placeholder="Enter your driving license number"
                  value={formData.drivingLicenseNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      drivingLicenseNumber: e.target.value,
                    })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself and your driving experience"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Profile Photo (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "profile")}
                    className="hidden"
                    id="profilePhoto"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="profilePhoto"
                    className="cursor-pointer block text-center"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {profilePhoto
                        ? profilePhoto.name
                        : "Click to upload your photo"}
                    </p>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Driving License Photo (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "license")}
                    className="hidden"
                    id="licensePhoto"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="licensePhoto"
                    className="cursor-pointer block text-center"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {drivingLicensePhoto
                        ? drivingLicensePhoto.name
                        : "Click to upload license photo"}
                    </p>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Driver Account"}
              </Button>
            </form>

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
  );
}
