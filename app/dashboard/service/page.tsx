"use client"

import { useRouter } from 'next/navigation'

export default function ServiceRoute() {
    const router = useRouter()
  return (
    router.push("/dashboard/service/airtime")
  )
}
