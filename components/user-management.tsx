"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Ban, UserCheck, Users, Car } from "lucide-react"

// Mock users data
const mockUsers = [
  {
    id: "1",
    name: "Sarah Ahmed",
    email: "sarah.ahmed@example.com",
    phone: "+880 1234-567890",
    type: "car_owner",
    status: "active",
    joinedDate: "2024-01-05",
    totalBookings: 12,
    lastActive: "2024-01-15",
  },
  {
    id: "2",
    name: "Ahmed Rahman",
    email: "ahmed.rahman@example.com",
    phone: "+880 1987-654321",
    type: "driver",
    status: "active",
    joinedDate: "2023-12-20",
    totalBookings: 45,
    lastActive: "2024-01-14",
    verified: true,
  },
  {
    id: "3",
    name: "Karim Hassan",
    email: "karim.hassan@example.com",
    phone: "+880 1555-123456",
    type: "car_owner",
    status: "suspended",
    joinedDate: "2024-01-01",
    totalBookings: 3,
    lastActive: "2024-01-10",
  },
  {
    id: "4",
    name: "Rashida Begum",
    email: "rashida.begum@example.com",
    phone: "+880 1777-987654",
    type: "driver",
    status: "active",
    joinedDate: "2023-11-15",
    totalBookings: 67,
    lastActive: "2024-01-15",
    verified: true,
  },
]

export function UserManagement() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: "suspended" } : user)))
  }

  const handleActivateUser = (userId: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: "active" } : user)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-700"
      case "suspended":
        return "bg-red-500/20 text-red-700"
      case "inactive":
        return "bg-gray-500/20 text-gray-700"
      default:
        return "bg-gray-500/20 text-gray-700"
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
    const matchesStatus = filterStatus === "all" || user.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
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
                <SelectItem value="car_owner">Car Owners</SelectItem>
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
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
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
                <div key={user.id} className="border rounded-lg p-4 space-y-4">
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
                          {user.type === "driver" && user.verified && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium capitalize">{user.type.replace("_", " ")}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Joined:</span>
                      <div className="font-medium">{new Date(user.joinedDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Bookings:</span>
                      <div className="font-medium">{user.totalBookings}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Active:</span>
                      <div className="font-medium">{new Date(user.lastActive).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {user.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspendUser(user.id)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend User
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivateUser(user.id)}
                        className="bg-transparent"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
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
