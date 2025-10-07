"use client"

import type React from "react"


import { User, CheckCircle, Clock, XCircle, Camera } from "lucide-react"
import { useRef, useState } from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/buttons"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { UserProfile } from "@/types/authContext"


interface ProfileProps {
  user: UserProfile | null
}

export function ProfileAvatar({ user }: ProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("Image size must be less than 5MB")
        return
      }

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setIsUploading(true)

      try {
        // Simulate upload process - replace with actual upload logic
        await new Promise((resolve) => setTimeout(resolve, 1500))
        console.log("[v0] Image uploaded successfully:", file.name)
        // Here you would typically upload to your backend/storage service
      } catch (error) {
        console.error("[v0] Upload failed:", error)
        setPreviewUrl(null) // Reset on error
        alert("Upload failed. Please try again.")
      } finally {
        setIsUploading(false)
      }
    }
  }

  const getKycBadge = () => {
    switch (user?.kycStatus) {
      case "verified":
        return (
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">KYC Pending</span>
            <span className="sm:hidden">Pending</span>
          </Badge>
        )
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
      <div className="relative group">
        <div className="relative cursor-pointer" onClick={handleImageClick}>
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-border transition-all group-hover:border-primary/50">
            <AvatarImage
              src={previewUrl || user?.displayPicture || "/placeholder.svg"}
              alt={`${user?.firstName} ${user?.lastName}`}
            />
            <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
              <User className="w-6 h-6 sm:w-8 sm:h-8" />
            </AvatarFallback>
          </Avatar>

          <div
            className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity ${
              isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {isUploading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      <div className="space-y-2 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-balance">
          {user?.firstName} {user?.lastName}
        </h2>
        {getKycBadge()}
        <Button
          variant="outline"
          size="sm"
          onClick={handleImageClick}
          disabled={isUploading}
          className="sm:hidden mt-2 bg-transparent"
        >
          <Camera className="w-4 h-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Photo"}
        </Button>
      </div>
    </div>
  )
}
