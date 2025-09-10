"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Eye, FileText, Clock, Loader2 } from "lucide-react";

interface DriverApplication {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    emailVerified: boolean;
    createdAt: string;
    profilePhoto?: string;
  };
  name?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationalId: string;
  drivingLicenseNumber: string;
  drivingLicensePhoto?: string;
  location: string;
  bio?: string;
  experience?: string;
  approved: boolean;
  createdAt: string;
}

//component
export function DriverApplications() {
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<DriverApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/drivers");
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error("Failed to fetch applications");
        alert("Failed to fetch driver applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      alert("Error fetching driver applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setActionLoading(applicationId);
      const response = await fetch("/api/admin/drivers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driverId: applicationId,
          approved: true,
        }),
      });

      if (response.ok) {
        // Remove the approved application from the list
        setApplications(
          applications.filter((app) => app._id !== applicationId)
        );
        alert("Driver application approved successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to approve application: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Error approving application");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (
      !confirm(
        "Are you sure you want to reject this application? This will permanently delete the user account and driver data."
      )
    ) {
      return;
    }

    try {
      setActionLoading(applicationId);
      const response = await fetch("/api/admin/drivers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driverId: applicationId,
          approved: false,
        }),
      });

      if (response.ok) {
        // Remove the rejected application from the list
        setApplications(
          applications.filter((app) => app._id !== applicationId)
        );
        alert(
          "Driver application rejected and user account deleted successfully!"
        );
      } else {
        const errorData = await response.json();
        alert(`Failed to reject application: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Error rejecting application");
    } finally {
      setActionLoading(null);
    }
  };

  const viewDetails = (application: DriverApplication) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const getDisplayName = (application: DriverApplication) => {
    return application.name || application.userId?.name || "Unknown";
  };

  const getDisplayEmail = (application: DriverApplication) => {
    return application.email || application.userId?.email || "";
  };

  const getDisplayPhone = (application: DriverApplication) => {
    return application.phone || application.userId?.phone || "";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">
            Loading driver applications...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Applications */}
      {applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Applications ({applications.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {getDisplayName(application)
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {getDisplayName(application)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getDisplayEmail(application)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Applied:{" "}
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-700">
                      Pending
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <div className="font-medium">
                        {getDisplayPhone(application)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <div className="font-medium">
                        {application.location || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Experience:</span>
                      <div className="font-medium">
                        {application.experience || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">License:</span>
                      <div className="font-medium">
                        {application.drivingLicenseNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewDetails(application)}
                      className="bg-transparent"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(application._id)}
                      disabled={actionLoading === application._id}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      {actionLoading === application._id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(application._id)}
                      disabled={actionLoading === application._id}
                    >
                      {actionLoading === application._id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {applications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No pending driver applications
            </p>
          </CardContent>
        </Card>
      )}

      {/* Application Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Driver Application Details</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getDisplayName(selectedApplication)
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {getDisplayName(selectedApplication)}
                  </h3>
                  <p className="text-muted-foreground">
                    {getDisplayEmail(selectedApplication)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <p className="text-sm">
                    {getDisplayPhone(selectedApplication)}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <p className="text-sm">
                    {selectedApplication.dateOfBirth
                      ? new Date(
                          selectedApplication.dateOfBirth
                        ).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">National ID</label>
                  <p className="text-sm">{selectedApplication.nationalId}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Driving License</label>
                  <p className="text-sm">
                    {selectedApplication.drivingLicenseNumber}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-sm">{selectedApplication.location}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience</label>
                  <p className="text-sm">
                    {selectedApplication.experience || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <p className="text-sm">
                  {selectedApplication.bio || "Not provided"}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profile Photo</label>
                    <div className="border rounded-lg p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        View Photo
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">National ID</label>
                    <div className="border rounded-lg p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">View NID</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Driving License
                    </label>
                    <div className="border rounded-lg p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        View License
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                  onClick={() => {
                    handleReject(selectedApplication._id);
                    setIsDetailModalOpen(false);
                  }}
                  disabled={actionLoading === selectedApplication._id}
                >
                  {actionLoading === selectedApplication._id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Reject Application
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleApprove(selectedApplication._id);
                    setIsDetailModalOpen(false);
                  }}
                  disabled={actionLoading === selectedApplication._id}
                >
                  {actionLoading === selectedApplication._id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Approve Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
