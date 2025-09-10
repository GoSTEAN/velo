import { useState, useEffect, useCallback } from 'react';

interface PaymentMonitorProps {
  expectedAmount: bigint;
  receiverAddress: string;
  tokenAddress: string;
  enabled: boolean;
  pollInterval?: number;
}

export function usePaymentMonitor({
  expectedAmount,
  receiverAddress,
  tokenAddress,
  enabled,
  pollInterval = 10000 // Faster polling for production
}: PaymentMonitorProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkPayment = useCallback(async () => {
    if (!enabled) return;

    try {
      setPaymentStatus('pending'); // Reset to pending on each check
      const response = await fetch('/api/payment-monitor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add auth header if required by backend
          ...(process.env.NEXT_PUBLIC_PAYMENT_API_KEY && {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYMENT_API_KEY}`
          })
        },
        body: JSON.stringify({
          expectedAmount: expectedAmount.toString(),
          receiverAddress,
          tokenAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'success' || data.status === 'confirmed') {
        setPaymentStatus('success');
        setTransaction(data.transaction);
        setError(null);
      } else if (data.status === 'pending') {
        setPaymentStatus('pending');
      } else if (data.error) {
        setPaymentStatus('error');
        setError(data.error);
      } else {
        setPaymentStatus('error');
        setError('Unknown response status');
      }
    } catch (err) {
      setPaymentStatus('error');
      setError('Failed to check payment status');
      console.error('Payment check error:', err);
    }
  }, [expectedAmount, receiverAddress, tokenAddress, enabled]);

  useEffect(() => {
    if (!enabled) {
      setPaymentStatus('idle');
      return;
    }

    // Initial check
    checkPayment();

    const intervalId = setInterval(checkPayment, pollInterval);

    return () => clearInterval(intervalId);
  }, [checkPayment, enabled, pollInterval]);

  return {
    paymentStatus,
    transaction,
    error,
    checkPayment,
  };
}