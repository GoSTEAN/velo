'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/buttons'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiMessage(null)
    setIsLoading(true)

    try {
      const success = await apiClient.ForgotPassword(formData.email)

      if (success) {
        toast.success("Reset Password Email sent successfully")
      } else {
        setApiMessage('failed. Please check your credentials.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setApiMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen max-w-md w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to <span className="velo-text-gradient">VELO</span>
          </h1>
          <p className="text-muted-foreground">
            Reset Your password 
          </p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border/50 w-full  rounded-2xl p-8 space-y-6"
        >
          {apiMessage && (
            <div className="text-center text-red-500 text-sm">{apiMessage}</div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative flex items-center space-x-3 ">
                <Mail className=" h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className=" bg-background/50"
                />
              </div>
            </div>

           
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full velo-gradient text-white font-semibold"
          >
            {isLoading ? 'Sending email...' : 'Continue'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Back to {" "}
            <Link
              href="/auth/login"
              className="text-primary font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
