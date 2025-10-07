'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/components/context/AuthContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/buttons'
import { useRouter } from 'next/navigation'

export default function SignupForm() {
  const router = useRouter()
  const { register } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeToTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiMessage(null)

    if (!formData.agreeToTerms) {
      setApiMessage('You must agree to the terms and conditions')
      return
    }

    setIsLoading(true)

    try {
      const result = await register(formData.email, formData.password)

      if (result?.success) {
        // Navigate to verification step or dashboard depending on your flow
        router.push('/verify?email=' + encodeURIComponent(formData.email))
      } else {
        setApiMessage('Registration failed. Please try again.')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.'
      setApiMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
            Create your <span className="velo-text-gradient">VELO</span> account
          </h1>
          <p className="text-muted-foreground">
            Start accepting crypto payments in minutes
          </p>
        </div>

        {/* Signup form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border/50 rounded-2xl p-8 space-y-6"
        >
          {apiMessage && (
            <div className="text-center text-red-500 text-sm">{apiMessage}</div>
          )}

          <div className="space-y-4">
         

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                    className="pl-10 pr-10 bg-background/50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground bg" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="pl-10 pr-10 bg-background/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex flex-row items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeToTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeToTerms: e.target.checked })
                }
                className="rounded border-border mt-1"
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal items-start flex flex-col lg:flex-row cursor-pointer leading-relaxed"
              >
                <span>I agree to the </span>
                <Link
                  href="/terms"
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full velo-gradient text-white font-semibold"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
