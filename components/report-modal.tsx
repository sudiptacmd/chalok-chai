"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Flag } from "lucide-react"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  driverId: string
}

const reportReasons = [
  "Inappropriate behavior",
  "Safety concerns",
  "Unprofessional conduct",
  "Fraud or scam",
  "Harassment",
  "Other",
]

export function ReportModal({ isOpen, onClose, driverId }: ReportModalProps) {
  const [reportData, setReportData] = useState({
    reason: "",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle report submission
    console.log("Report submitted:", { driverId, ...reportData })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Flag className="h-5 w-5" />
            <span>Report Driver</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Reason for Report</Label>
            <Select
              value={reportData.reason}
              onValueChange={(value) => setReportData({ ...reportData, reason: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please provide details about the issue"
              value={reportData.description}
              onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" variant="destructive" className="flex-1">
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
