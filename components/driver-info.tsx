"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Upload, Shield } from "lucide-react";

export function DriverInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const [driverData, setDriverData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const { profile, user } = await res.json();
        setDriverData(profile);
        setUserData(user);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driverData),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/profile-photo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await res.json();

      // Update the user data with the new profile photo
      setUserData((prev) => ({
        ...prev,
        profilePhoto: result.url,
      }));

      // Optionally refresh the entire profile
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const { profile, user } = await profileRes.json();
        setDriverData(profile);
        setUserData(user);
      }

      // Refresh the page to update session data in header
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!driverData) return <div>No profile data found.</div>;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Driver Profile</CardTitle>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={userData?.profilePhoto || undefined}
                  alt={userData?.name || driverData?.name || ""}
                />
                <AvatarFallback className="text-lg">
                  {userData?.name || driverData?.name
                    ? (userData?.name || driverData?.name)
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : "?"}
                </AvatarFallback>
              </Avatar>
              {driverData.verified && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                {userData?.name || driverData?.name}
              </h2>
              <Badge
                variant="secondary"
                className="bg-green-500/20 text-green-700"
              >
                Verified Driver
              </Badge>
              {isEditing && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("photo-upload")?.click()
                    }
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Change Photo"}
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={driverData.name || ""}
                  onChange={(e) =>
                    setDriverData({ ...driverData, name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={driverData.email || ""}
                  onChange={(e) =>
                    setDriverData({ ...driverData, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={driverData.phone || ""}
                  onChange={(e) =>
                    setDriverData({ ...driverData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={
                    driverData.dateOfBirth
                      ? driverData.dateOfBirth.slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setDriverData({
                      ...driverData,
                      dateOfBirth: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={driverData.location || ""}
                  onChange={(e) =>
                    setDriverData({ ...driverData, location: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input
                  id="nationalId"
                  value={driverData.nationalId || ""}
                  onChange={(e) =>
                    setDriverData({ ...driverData, nationalId: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drivingLicense">Driving License</Label>
                <Input
                  id="drivingLicense"
                  value={driverData.drivingLicenseNumber || ""}
                  onChange={(e) =>
                    setDriverData({
                      ...driverData,
                      drivingLicenseNumber: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={driverData.experience || ""}
                  onChange={(e) =>
                    setDriverData({ ...driverData, experience: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerDay">Price per Day (৳)</Label>
                  <Input
                    id="pricePerDay"
                    type="number"
                    value={driverData.pricePerDay || ""}
                    onChange={(e) =>
                      setDriverData({
                        ...driverData,
                        pricePerDay: Number(e.target.value) || null,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerMonth">Price per Month (৳)</Label>
                  <Input
                    id="pricePerMonth"
                    type="number"
                    value={driverData.pricePerMonth || ""}
                    onChange={(e) =>
                      setDriverData({
                        ...driverData,
                        pricePerMonth: Number(e.target.value) || null,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={driverData.bio || ""}
                onChange={(e) =>
                  setDriverData({ ...driverData, bio: e.target.value })
                }
                disabled={!isEditing}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              {isEditing ? (
                <Input
                  id="languages"
                  value={(driverData.languages || []).join(", ")}
                  onChange={(e) => {
                    // Allow spaces and commas, split by comma
                    const value = e.target.value;
                    const arr = value
                      .split(",")
                      .map((l: string) => l.trim())
                      .filter((l: string) => l.length > 0);
                    setDriverData({ ...driverData, languages: arr });
                  }}
                  placeholder="e.g. Bengali, English, Hindi"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(driverData.languages || []).map((language: string) => (
                    <Badge key={language} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferences">Preferences</Label>
              {isEditing ? (
                <Input
                  id="preferences"
                  value={(driverData.preferences || []).join(", ")}
                  onChange={(e) => {
                    // Allow spaces and commas, split by comma
                    const value = e.target.value;
                    const arr = value
                      .split(",")
                      .map((p: string) => p.trim())
                      .filter((p: string) => p.length > 0);
                    setDriverData({ ...driverData, preferences: arr });
                  }}
                  placeholder="e.g. Non-smoker, English speaking, Pet-friendly"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(driverData.preferences || []).map((preference: string) => (
                    <Badge key={preference} variant="secondary">
                      {preference}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
