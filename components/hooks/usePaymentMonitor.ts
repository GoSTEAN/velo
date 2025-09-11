"use client"

import { useState, useEffect, useCallback } from "react"

interface PaymentMonitorProps {
  expectedAmount: bigint
  receiverAddress: string
  tokenAddress: string
  enabled: boolean
  pollInterval?: number
}

export function usePaymentMonitor({
  expectedAmount,
  receiverAddress,
  tokenAddress,
  enabled,
  pollInterval = 8000, // Faster polling for better responsiveness
}: PaymentMonitorProps) {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [transaction, setTransaction] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkPayment = useCallback(async () => {
    if (!enabled) return

    try {
      if (paymentStatus === "idle") {
        setPaymentStatus("pending")
      }

      console.log("[v0] Checking payment status...", {
        expectedAmount: expectedAmount.toString(),
        receiverAddress,
        tokenAddress,
      })

      const response = await fetch("/api/payment-monitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth header if required by backend
          ...(process.env.NEXT_PUBLIC_PAYMENT_API_KEY && {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYMENT_API_KEY}`,
          }),
        },
        body: JSON.stringify({
          expectedAmount: expectedAmount.toString(),
          receiverAddress,
          tokenAddress,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Payment check response:", data)

      if (data.status === "success" || data.status === "confirmed") {
        setPaymentStatus("success")
        setTransaction(data.transaction)
        setError(null)
        console.log("[v0] Payment confirmed!", data.transaction)
      } else if (data.status === "pending") {
        if (paymentStatus !== "success") {
          setPaymentStatus("pending")
        }
      } else if (data.error) {
        setPaymentStatus("error")
        setError(data.error)
        console.error("[v0] Payment error:", data.error)
      } else {
        setPaymentStatus("error")
        setError("Unknown response status")
      }
    } catch (err) {
      setPaymentStatus("error")
      setError("Failed to check payment status")
      console.error("[v0] Payment check error:", err)
    }
  }, [expectedAmount, receiverAddress, tokenAddress, enabled, paymentStatus])

  useEffect(() => {
    if (!enabled) {
      setPaymentStatus("idle")
      setTransaction(null)
      setError(null)
      return
    }

    // Initial check
    checkPayment()

    const intervalId = setInterval(checkPayment, pollInterval)

    return () => clearInterval(intervalId)
  }, [checkPayment, enabled, pollInterval])

  return {
    paymentStatus,
    transaction,
    error,
    checkPayment,
  }
}
