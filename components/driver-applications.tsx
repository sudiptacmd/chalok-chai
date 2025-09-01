"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X, Eye, FileText, Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DriverApplication {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    phone: string
    emailVerified: boolean
    createdAt: string
    profilePhoto?: string
  }
  nationalId: string
  drivingLicenseNumber: string
  drivingLicensePhoto?: string
  location: string
  bio: string
  dateOfBirth: string
  approved: boolean
  createdAt: string
}

//component
export function DriverApplications() {
  const [applications, setApplications] = useState<DriverApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<DriverApplication | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Fetch pending driver applications
  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/drivers')
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      
      const data = await response.json()
      setApplications(data)
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to fetch driver applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    try {
      setActionLoading(applicationId)
      const response = await fetch('/api/admin/drivers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: applicationId,
          approved: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve driver')
      }

      const result = await response.json()
      
      // Remove from pending applications since they're now approved
      setApplications(prev => prev.filter(app => app._id !== applicationId))
      
      toast.success(`${result.driver.name} has been approved successfully`)
    } catch (error) {
      console.error('Error approving driver:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to approve driver')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      setActionLoading(applicationId)
      const response = await fetch('/api/admin/drivers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: applicationId,
          approved: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject driver')
      }

      const result = await response.json()
      
      // Remove from pending applications since they're now processed
      setApplications(prev => prev.filter(app => app._id !== applicationId))
      
      toast.success(`${result.driver.name} has been rejected`)
    } catch (error) {
      console.error('Error rejecting driver:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to reject driver')
    } finally {
      setActionLoading(null)
    }
  }

  const viewDetails = (application: DriverApplication) => {
    setSelectedApplication(application)
    setIsDetailModalOpen(true)
  }

  const getStatusColor = (approved: boolean) => {
    return approved
      ? "bg-green-500/20 text-green-700"
      : "bg-yellow-500/20 text-yellow-700"
  }

  // All applications are pending since API only returns unapproved drivers
  const pendingApplications = applications

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading applications...</span>
      </div>
    )
  }

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
                <div key={application._id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        {application.userId.profilePhoto && (
                          <AvatarImage src={application.userId.profilePhoto} />
                        )}
                        <AvatarFallback>
                          {application.userId.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{application.userId.name}</h3>
                        <p className="text-sm text-muted-foreground">{application.userId.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Applied: {new Date(application.createdAt).toLocaleDateString()}
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
                      <div className="font-medium">{application.userId.phone}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <div className="font-medium">{application.location}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <div className="font-medium">
                        {new Date().getFullYear() - new Date(application.dateOfBirth).getFullYear()} years
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">License:</span>
                      <div className="font-medium">{application.drivingLicenseNumber}</div>
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
            <p className="text-muted-foreground">No pending driver applications</p>
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
                  {selectedApplication.userId.profilePhoto && (
                    <AvatarImage src={selectedApplication.userId.profilePhoto} />
                  )}
                  <AvatarFallback className="text-lg">
                    {selectedApplication.userId.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedApplication.userId.name}</h3>
                  <p className="text-muted-foreground">{selectedApplication.userId.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <p className="text-sm">{selectedApplication.userId.phone}</p>
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
                  <p className="text-sm">{selectedApplication.drivingLicenseNumber}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-sm">{selectedApplication.location}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Verified</label>
                  <p className="text-sm">
                    {selectedApplication.userId.emailVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-red-600">✗ Not Verified</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <p className="text-sm">{selectedApplication.bio || "No bio provided"}</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profile Photo</label>
                    <div className="border rounded-lg p-4 text-center">
                      {selectedApplication.userId.profilePhoto ? (
                        <img 
                          src={selectedApplication.userId.profilePhoto} 
                          alt="Profile" 
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <>
                          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">No photo uploaded</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Driving License</label>
                    <div className="border rounded-lg p-4 text-center">
                      {selectedApplication.drivingLicensePhoto ? (
                        <img 
                          src={selectedApplication.drivingLicensePhoto} 
                          alt="License" 
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <>
                          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">No license photo uploaded</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                  onClick={() => {
                    handleReject(selectedApplication._id)
                    setIsDetailModalOpen(false)
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
                    handleApprove(selectedApplication._id)
                    setIsDetailModalOpen(false)
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
  )
}
