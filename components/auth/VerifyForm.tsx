'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter} from 'next/navigation'
import { useAuth } from '@/components/context/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/buttons'
import { ArrowLeft } from 'lucide-react'

type VerifyFormProps = {
  email: string
}

export default function VerifyForm({ email }: VerifyFormProps) {
  const router = useRouter()
  const { verifyOtp, resendOtp } = useAuth()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [apiMessage, setApiMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resending, setResending] = useState(false)

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-lg text-foreground mb-2">Missing email address.</p>
          <Link href="/auth/signup" className="text-primary underline">
            Go back to Signup
          </Link>
        </div>
      </div>
    )
  }

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return 
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiMessage(null)
    setIsLoading(true)

    try {
      const code = otp.join('')
      const result = await verifyOtp(email, code)

      if (result?.success) {
        setApiMessage('✅ Email verified successfully!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        setApiMessage(result?.message || 'Verification failed. Try again.')
      }
    } catch (err) {
      setApiMessage(err instanceof Error ? err.message : 'Verification failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setApiMessage(null)
    setResending(true)
    try {
      const result = await resendOtp(email)
      setApiMessage(result?.message || 'A new code has been sent to your email.')
    } catch {
      setApiMessage('Failed to resend verification code.')
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Back button */}
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to signup
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Verify your email</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        {/* Verify Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border/50 rounded-2xl p-8 space-y-6"
        >
          {apiMessage && (
            <div className="text-center text-sm text-red-500">{apiMessage}</div>
          )}

          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-12 h-12 text-center text-lg font-semibold tracking-widest  border border-border/50"
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full velo-gradient text-white font-semibold"
          >
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Didn’t receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-primary font-medium hover:underline"
            >
              {resending ? 'Resending...' : 'Resend code'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
