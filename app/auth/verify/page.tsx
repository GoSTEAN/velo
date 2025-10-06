'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import VerifyForm from '@/components/auth/VerifyForm'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const param = searchParams.get('email')
    if (param) {
      setEmail(param)
      router.replace('/auth/verify') // hides ?email= from address bar
    }
  }, [searchParams, router])

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <p>Missing email parameter. Please go back and sign up again.</p>
      </div>
    )
  }

  return <VerifyForm email={email} />
}
