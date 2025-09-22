"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import {
  Plus,
  Camera,
  Edit3,
  Check,
  X,
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
} from "lucide-react";
import Image from "next/image";
import BankVerification from "./bank-details";
import { useAuth } from "../context/AuthContext";

interface VerificationResult {
  account_number: string;
  account_name: string;
  bank_id: number;
}

export default function ProfileSettingsPage() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const { user, token, updateProfile, fetchUserProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [showBankVerification, setShowBankVerification] = useState(false);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when user data changes - only when user is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!token) return;

    setIsUpdating(true);
    try {
      // Prepare the data to update - convert empty strings to null
      const updateData = {
        firstName: formData.firstName === "" ? null : formData.firstName,
        lastName: formData.lastName === "" ? null : formData.lastName,
        phoneNumber: formData.phoneNumber === "" ? null : formData.phoneNumber,
      };

      const success = await updateProfile(updateData);
      
      if (success) {
        console.log("Profile updated successfully!");
        setEditMode(false);
        // Refresh the user data to get the latest from backend
        await fetchUserProfile(token);
      } else {
        console.error("Failed to update profile");
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data only if user exists
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
    setEditMode(false);
  };

  const handleAddBank = () => {
    setShowBankVerification(true);
  };

  const handleBankVerified = (result: VerificationResult) => {
    // Bank verification logic
    setShowBankVerification(false);
    setSelectedBank(null);
  };

  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <div className="w-full h-auto p-[32px_20px_172px_32px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-auto p-[32px_20px_172px_32px] transition-all duration-300">
      <div className="w-full flex flex-col">
        {/* Header */}
        <div className="w-full mb-6">
          <h1 className="text-foreground text-custom-xl">Profile Settings</h1>
          <p className="text-muted-foreground text-custom-md">
            Manage your profile information and preferences
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="w-full p-6 bg-Card border-border rounded-xl mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center relative overflow-hidden">
                    {profilePic ? (
                      <Image
                        src={profilePic}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-button hover:bg-hover text-button p-1.5 rounded-full shadow-md transition-colors"
                >
                  <Camera size={12} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) =>
                        setProfilePic(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              {/* Basic Info */}
              <div>
                <h2 className="text-foreground text-custom-lg font-bold">
                  {user?.firstName || "User"} {user?.lastName}
                </h2>
                <div className="flex items-center gap-1.5 mt-2">
                  <Shield size={14} className="text-green-600" />
                  <span className="text-green-700 text-custom-xs font-medium">
                    {user?.kycStatus === "verified" ? "KYC Verified" : "KYC Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Toggle */}
            <button
              onClick={() => (editMode ? handleCancel() : setEditMode(true))}
              className="flex items-center gap-2 px-4 py-2 bg-button hover:bg-hover text-button rounded-lg transition-colors text-custom-sm font-medium"
            >
              <Edit3 size={14} />
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="w-full p-6 bg-Card border-border flex-col rounded-xl mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-head" />
            <h3 className="text-foreground text-custom-md font-semibold">
              Personal Information
            </h3>
           
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-muted-foreground text-custom-sm font-medium">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                disabled={!editMode || !user}
                className={`w-full p-3 rounded-lg border text-custom-sm text-muted-foreground transition-colors ${
                  editMode && user
                    ? "border-border focus:border-head focus:ring-1 focus:ring-head/20"
                    : "border-border bg-background"
                } outline-none`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-muted-foreground text-custom-sm font-medium">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                disabled={!editMode || !user}
                className={`w-full p-3 rounded-lg border text-muted-foreground text-custom-sm transition-colors ${
                  editMode && user
                    ? "border-border focus:border-head focus:ring-1 focus:ring-head/20"
                    : "border-border bg-background"
                } outline-none`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-muted-foreground text-custom-sm font-medium">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full p-3 pr-10 rounded-lg text-muted-foreground border border-border bg-background outline-none text-custom-sm"
                />
                <Mail className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-custom-xs mt-1">
                Email cannot be changed
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-muted-foreground text-custom-sm font-medium">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  disabled={!editMode || !user}
                  className={`w-full p-3 pl-10 rounded-lg text-muted-foreground border text-custom-sm transition-colors ${
                    editMode && user
                      ? "border-border focus:border-head focus:ring-1 focus:ring-head/20"
                      : "border-border bg-background"
                  } outline-none`}
                />
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {editMode && user && (
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-hover transition-colors text-custom-sm"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-4 py-2 bg-button hover:bg-hover text-button rounded-lg transition-colors text-custom-sm disabled:opacity-50"
              >
                {isUpdating ? (
                  "Updating..."
                ) : (
                  <>
                    <Check size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </Card>


            {/* Financial Settings */}
            <Card className="w-full p-6 bg-Card border-border flex-col rounded-xl mb-6">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-head" />
              <h3 className="text-foreground text-custom-md font-semibold">
                Bank Accounts
              </h3>
            </div>
            <button
              onClick={handleAddBank}
              className="flex items-center gap-1.5 px-3 py-2 bg-button hover:bg-hover text-button rounded-lg transition-colors text-custom-sm font-medium"
            >
              <Plus size={14} />
              Add Bank
            </button>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-custom-sm">No bank accounts linked</p>
            <p className="text-muted-foreground text-custom-xs">
              Add a bank account to get started
            </p>
          </div>
        </Card>

        {/* KYC Section */}
        <Card className="w-full p-6 bg-Card border-border flex-col rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-head" />
            <h3 className="text-foreground text-custom-md font-semibold">
              Identity Verification
            </h3>
          </div>

          <div className={`flex items-center justify-between p-4 border rounded-lg ${
            user?.kycStatus === "verified" 
              ? "bg-green-100 border-green-200" 
              : "bg-yellow-100 border-yellow-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                user?.kycStatus === "verified" 
                  ? "bg-green-200" 
                  : "bg-yellow-200"
              }`}>
                <Shield className={`w-5 h-5 ${
                  user?.kycStatus === "verified" 
                    ? "text-green-600" 
                    : "text-yellow-600"
                }`} />
              </div>
              <div>
                <h4 className={`font-medium text-custom-sm ${
                  user?.kycStatus === "verified" 
                    ? "text-green-900" 
                    : "text-yellow-900"
                }`}>
                  {user?.kycStatus === "verified" 
                    ? "Identity Verified" 
                    : "Verification Required"}
                </h4>
                <p className={`text-custom-xs ${
                  user?.kycStatus === "verified" 
                    ? "text-green-700" 
                    : "text-yellow-700"
                }`}>
                  {user?.kycStatus === "verified" 
                    ? "Your identity has been successfully verified"
                    : "Complete KYC verification to unlock all features"}
                </p>
              </div>
            </div>
            {user?.kycStatus !== "verified" && (
              <button
                onClick={() => (window.location.href = "/kyc")}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-custom-sm"
              >
                Start Verification
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Bank Verification Modal */}
      <BankVerification
        show={showBankVerification}
        selectedBank={selectedBank}
        setSelectedBank={setSelectedBank}
        onClose={() => setShowBankVerification(false)}
        onBankVerified={handleBankVerified}
      />
    </div>
  );
}