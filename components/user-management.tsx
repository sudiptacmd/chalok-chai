"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Ban, UserCheck, Users, Car, Star, MapPin, Loader2, RefreshCw } from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  phone: string
  type: "owner" | "driver"
  status: "active" | "inactive" | "pending"
  emailVerified: boolean
  suspended?: boolean
  createdAt: string
  profilePhoto?: string
  approved?: boolean
  location?: string
  averageRating?: number
  totalRides?: number
  totalBookings?: number
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: "suspend" | "activate") => {
    try {
      setActionLoading(userId)
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      })

      if (response.ok) {
        const result = await response.json()
        // Update local state based on the API response
        setUsers(users.map((user) => 
          user._id === userId 
            ? { 
                ...user, 
                suspended: result.user.suspended,
                status: result.user.suspended ? "inactive" : 
                  (user.type === "driver" ? (user.approved ? "active" : "pending") : 
                   (user.emailVerified ? "active" : "inactive"))
              }
            : user
        ))
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  // Helper function to filter valid users (excluding unapproved drivers)
  const getValidUsers = () => {
    return users.filter(u => u.type === "owner" || (u.type === "driver" && u.approved))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-700"
      case "inactive":
        return "bg-red-500/20 text-red-700"
      case "pending":
        return "bg-yellow-500/20 text-yellow-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  const getStatusBadge = (user: User) => {
    if (user.suspended) {
      return { text: "Suspended", color: "bg-red-500/20 text-red-700" }
    }
    
    switch (user.status) {
      case "active":
        return { text: "Active", color: "bg-green-500/20 text-green-700" }
      case "inactive":
        return { text: "Inactive", color: "bg-red-500/20 text-red-700" }
      case "pending":
        return { text: "Pending", color: "bg-yellow-500/20 text-yellow-700" }
      default:
        return { text: "Unknown", color: "bg-gray-500/20 text-gray-700" }
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "driver" ? Car : Users
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || user.type === filterType
    
    let matchesStatus = filterStatus === "all"
    if (!matchesStatus) {
      if (filterStatus === "suspended") {
        matchesStatus = user.suspended === true
      } else if (filterStatus === "active") {
        matchesStatus = user.status === "active" && !user.suspended
        // For drivers, also check approval status
        if (user.type === "driver") {
          matchesStatus = matchesStatus && user.approved === true
        }
      } else {
        matchesStatus = user.status === filterStatus && !user.suspended
      }
    }

    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">
                  {getValidUsers().length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Drivers</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.type === "driver" && u.approved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Car Owners</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.type === "owner").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">
                  {getValidUsers().filter(u => u.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="owner">Car Owners</SelectItem>
                <SelectItem value="driver">Drivers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setFilterType("driver")
                setFilterStatus("active")
              }}
              className="whitespace-nowrap"
            >
              <Car className="h-4 w-4 mr-2" />
              Approved Drivers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const TypeIcon = getTypeIcon(user.type)
              return (
                <div key={user._id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          {user.type === "driver" && user.approved && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                              Approved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                        {user.type === "driver" && user.location && (
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {user.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusBadge(user).color}>
                      {getStatusBadge(user).text}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium capitalize">{user.type === "owner" ? "Car Owner" : "Driver"}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Joined:</span>
                      <div className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {user.type === "driver" ? "Total Rides:" : "Total Bookings:"}
                      </span>
                      <div className="font-medium">
                        {user.type === "driver" ? user.totalRides || 0 : user.totalBookings || 0}
                      </div>
                    </div>
                    {user.type === "driver" && user.averageRating !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="font-medium flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {user.averageRating.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!user.suspended ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserAction(user._id, "suspend")}
                        disabled={actionLoading === user._id}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Ban className="h-4 w-4 mr-2" />
                        )}
                        Suspend User
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserAction(user._id, "activate")}
                        disabled={actionLoading === user._id}
                        className="bg-transparent"
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4 mr-2" />
                        )}
                        Activate User
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="bg-transparent">
                      View Details
                    </Button>
                  </div>
                </div>
              )
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No users found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
