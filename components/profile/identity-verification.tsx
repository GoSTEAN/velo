"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, Clock, XCircle, AlertTriangle, Loader2, FileText } from "lucide-react"
import { useAuth, UserProfile } from "../context/AuthContext"
import { Button } from "../ui/buttons"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/cards"
import { toast } from "sonner"
import { Alert, AlertDescription } from "../ui/alert"


interface IdentityVerificationProps {
    kycStatus: UserProfile["kycStatus"] | undefined
}


export function IdentityVerification({ kycStatus }: IdentityVerificationProps) {
    const { isLoading } = useAuth()


    const handleStartVerification = async () => {
        try {
            //    const onSuccess =  await startKycVerification()
            const onSuccess = false

            if (onSuccess) {
                toast.success("Verification started", {
                    description: "Your identity verification process has been initiated.",
                })
            }
        } catch (error: string | any) {
            toast.error("Failed to start verification", {
                description: `Please try again. Error: ${error.message || error}`,
            })
        }
    }


    const getStatusContent = () => {
        switch (kycStatus) {
            case "verified":
                return {
                    icon: <CheckCircle className="w-5 h-5 text-success" />,
                    title: "Identity Verified",
                    description: "Your identity has been successfully verified. You have access to all features.",
                    badge: (
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                        </Badge>
                    ),
                    alert: (
                        <Alert className="border-success/20 bg-success/5">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <AlertDescription className="text-success">
                                Your identity verification is complete. All features are now available.
                            </AlertDescription>
                        </Alert>
                    ),
                    action: null,
                }
            case "rejected":
                return {
                    icon: <XCircle className="w-5 h-5 text-destructive" />,
                    title: "Verification Rejected",
                    description: "Your identity verification was rejected. Please contact support for assistance.",
                    badge: (
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                            <XCircle className="w-3 h-3 mr-1" />
                            Rejected
                        </Badge>
                    ),
                    alert: (
                        <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                                Your verification was rejected. Please contact support to resolve this issue.
                            </AlertDescription>
                        </Alert>
                    ),
                    action: (
                        <Button variant="outline" className="gap-2 bg-transparent w-full sm:w-auto">
                            <FileText className="w-4 h-4" />
                            Contact Support
                        </Button>
                    ),
                }
            default:
                return {
                    icon: <Clock className="w-5 h-5 text-warning" />,
                    title: "Verification Required",
                    description: "Complete KYC verification to unlock all features and increase your account limits.",
                    badge: (
                        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">KYC Pending</span>
                            <span className="sm:hidden">Pending</span>
                        </Badge>
                    ),
                    alert: (
                        <Alert className="border-warning/20 bg-warning/5">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            <AlertDescription className="text-warning">
                                Complete KYC verification to unlock all features and increase your account limits.
                            </AlertDescription>
                        </Alert>
                    ),
                    action: (
                        <Button onClick={handleStartVerification} disabled={isLoading} className="gap-2 w-full sm:w-auto">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                            Start Verification
                        </Button>
                    ),
                }
        }
    }

    const statusContent = getStatusContent()

    return (
        <Card className="transition-smooth hover:shadow-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pb-6">
                <div className="flex items-center gap-2">
                    {statusContent.icon}
                    <CardTitle className="text-lg sm:text-xl">Identity Verification</CardTitle>
                </div>
                {statusContent.badge}
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div>
                    <h3 className="font-medium mb-2">{statusContent.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty">{statusContent.description}</p>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    {statusContent.alert}
                </motion.div>

                {statusContent.action && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        {statusContent.action}
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}
