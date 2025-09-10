"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X, Eye, FileText, Clock } from "lucide-react"

// Mock driver applications data
const mockApplications = [
  {
    id: "1",
    name: "Rahman Ali",
    email: "rahman.ali@example.com",
    phone: "+880 1234-567890",
    dateOfBirth: "1988-05-20",
    nationalId: "1234567890123",
    drivingLicense: "DL987654321",
    location: "Dhaka, Mirpur",
    experience: "3 years",
    bio: "Experienced driver with clean driving record.",
    appliedDate: "2024-01-10",
    status: "pending",
    documents: {
      nidImage: "/document-placeholder.png",
      licenseImage: "/document-placeholder.png",
      photo: "/professional-driver-portrait.png",
    },
  },
  {
    id: "2",
    name: "Fatima Khatun",
    email: "fatima.khatun@example.com",
    phone: "+880 1987-654321",
    dateOfBirth: "1990-08-15",
    nationalId: "9876543210987",
    drivingLicense: "DL123456789",
    location: "Dhaka, Wari",
    experience: "2 years",
    bio: "Professional female driver with excellent customer service.",
    appliedDate: "2024-01-12",
    status: "pending",
    documents: {
      nidImage: "/document-placeholder.png",
      licenseImage: "/document-placeholder.png",
      photo: "/professional-female-driver.png",
    },
  },
]

//component
export function DriverApplications() {
  const [applications, setApplications] = useState(mockApplications)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleApprove = (applicationId: string) => {
    setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: "approved" } : app)))
  }

  const handleReject = (applicationId: string) => {
    setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: "rejected" } : app)))
  }

  const viewDetails = (application: any) => {
    setSelectedApplication(application)
    setIsDetailModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700"
      case "approved":
        return "bg-green-500/20 text-green-700"
      case "rejected":
        return "bg-red-500/20 text-red-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  const pendingApplications = applications.filter((app) => app.status === "pending")
  const processedApplications = applications.filter((app) => app.status !== "pending")

  return (
    <div className="space-y-6">
      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Applications ({pendingApplications.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {application.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{application.name}</h3>
                        <p className="text-sm text-muted-foreground">{application.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Applied: {new Date(application.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <div className="font-medium">{application.phone}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <div className="font-medium">{application.location}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Experience:</span>
                      <div className="font-medium">{application.experience}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">License:</span>
                      <div className="font-medium">{application.drivingLicense}</div>
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
                      onClick={() => handleReject(application.id)}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(application.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Applications */}
      {processedApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedApplications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {application.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{application.name}</h3>
                        <p className="text-sm text-muted-foreground">{application.email}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
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
            <p className="text-muted-foreground">No driver applications</p>
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
                    {selectedApplication.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedApplication.name}</h3>
                  <p className="text-muted-foreground">{selectedApplication.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <p className="text-sm">{selectedApplication.phone}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <p className="text-sm">{new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">National ID</label>
                  <p className="text-sm">{selectedApplication.nationalId}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Driving License</label>
                  <p className="text-sm">{selectedApplication.drivingLicense}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-sm">{selectedApplication.location}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience</label>
                  <p className="text-sm">{selectedApplication.experience}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <p className="text-sm">{selectedApplication.bio}</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profile Photo</label>
                    <div className="border rounded-lg p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">View Photo</p>
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
                    <label className="text-sm font-medium">Driving License</label>
                    <div className="border rounded-lg p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">View License</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedApplication.status === "pending" && (
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    onClick={() => {
                      handleReject(selectedApplication.id)
                      setIsDetailModalOpen(false)
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleApprove(selectedApplication.id)
                      setIsDetailModalOpen(false)
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
