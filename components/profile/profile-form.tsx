"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/cards"
import { Edit3, Loader2, Mail, Phone, User, X } from "lucide-react"
import { Button } from "../ui/buttons"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useAuth } from "../context/AuthContext"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import { UserProfile } from "@/types/authContext"


export function ProfileForm() {
    const { user, updateProfile, } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<UserProfile | null>(null)

    
    useEffect(() => {
        if (user && user.id) {
            const freshFormData = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                isEmailVerified: user.isEmailVerified,
                kyc: user.kyc,
                kycStatus: user.kycStatus,
                createdAt: user.createdAt,
                username: user.username,
                displayPicture: user.displayPicture,
                bankDetails: user.bankDetails,
                hasTransactionPin: user.hasTransactionPin 
            };
            setFormData(freshFormData);
        } else {
            console.log(" No valid user data, clearing form");
            setFormData(null);
        }
    }, [user]);

   

    const handleSave = async () => {
        if (!formData) {
            toast.error(" No form data to save");
            return;
        }

       
        setIsSaving(true);

        const toastId = toast.loading('Updating profile...');

        try {
            const updatedUser = await updateProfile(formData);
            
            if (updatedUser) {
                console.log("✅ Profile update successful:", updatedUser);
                setIsEditing(false);
                
                // Force update form data with fresh server data
                setFormData({ ...updatedUser });
                
                toast.success("Your profile information has been successfully updated.", {
                    id: toastId
                });
            } else {
                throw new Error("Update returned null");
            }

        } catch (error: any) {
            console.error(" Profile update failed:", error);
            toast.error(`Failed to update profile: ${error.message || error}`, {
                id: toastId
            });
        } finally {
            setIsSaving(false);
        }
    }

    const handleCancel = () => {
        console.log(" Canceling edit, reverting to user data");
        if (user && user.id) {
            setFormData({ ...user });
        }
        setIsEditing(false);
    }

    // Show loading while auth is initializing
    // if (authLoading) {
    //     return (
    //         <Card className="transition-smooth hover:shadow-md">
    //             <CardContent className="flex justify-center items-center py-8">
    //                 <Loader2 className="w-6 h-6 animate-spin" />
    //                 <span className="ml-2">Loading profile...</span>
    //             </CardContent>
    //         </Card>
    //     );
    // }

    // Show message if no user data
    if (!user) {
        return (
            <Card className="transition-smooth hover:shadow-md">
                <CardContent className="flex justify-center items-center py-8">
                    <div className="text-center">
                        <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No profile data available</p>
                        <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="transition-smooth hover:shadow-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pb-6">
                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
                </div>
                <AnimatePresence mode="wait">
                    {!isEditing ? (
                        <motion.div
                            key="edit"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2 w-full sm:w-auto">
                                <Edit3 className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="actions"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-2 w-full sm:w-auto"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="gap-2 bg-transparent flex-1 sm:flex-none"
                            >
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline">Cancel</span>
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2 flex-1 sm:flex-none">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> :""}
                                <span className="hidden sm:inline">Save changes</span>
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">
                            First Name
                        </Label>
                        <Input
                            id="firstName"
                            value={formData?.firstName || ""}
                            onChange={(e) => {
                                console.log("✏️ Updating firstName:", e.target.value);
                                setFormData((prev) => prev ? ({
                                    ...prev,
                                    firstName: e.target.value,
                                }) : null);
                            }}
                            disabled={!isEditing}
                            className="transition-smooth"
                            placeholder="Enter first name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">
                            Last Name
                        </Label>
                        <Input
                            id="lastName"
                            value={formData?.lastName || ""}
                            onChange={(e) => {
                                console.log("✏️ Updating lastName:", e.target.value);
                                setFormData((prev) => prev ? ({
                                    ...prev,
                                    lastName: e.target.value,
                                }) : null);
                            }}
                            disabled={!isEditing}
                            className="transition-smooth"
                            placeholder="Enter last name"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={formData?.email || ""}
                                disabled={true}
                                className="pl-10 bg-muted/50"
                                placeholder="Enter email"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-sm font-medium">
                            Phone Number
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="phoneNumber"
                                value={formData?.phoneNumber || ""}
                                onChange={(e) => {
                                    console.log("✏️ Updating phoneNumber:", e.target.value);
                                    setFormData((prev) => prev ? ({
                                        ...prev,
                                        phoneNumber: e.target.value
                                    }) : null);
                                }}
                                disabled={!isEditing}
                                className="pl-10 transition-smooth"
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                        Username
                    </Label>
                    <div className="relative max-w-md">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="username"
                            value={formData?.username || ""}
                            onChange={(e) => {
                                console.log("✏️ Updating username:", e.target.value);
                                setFormData((prev) => prev ? ({
                                    ...prev,
                                    username: e.target.value,
                                }) : null);
                            }}
                            disabled={!isEditing}
                            className="pl-10 transition-smooth"
                            placeholder="Enter username"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}