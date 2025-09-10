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
  pollInterval = 15000
}: PaymentMonitorProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkPayment = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await fetch('/api/payment-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedAmount: expectedAmount.toString(),
          receiverAddress,
          tokenAddress,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setPaymentStatus('success');
        setTransaction(data.transaction);
        setError(null);
      } else if (data.status === 'pending') {
        setPaymentStatus('pending');
      } else if (data.error) {
        setPaymentStatus('error');
        setError(data.error);
      }
    } catch (err) {
      setPaymentStatus('error');
      setError('Failed to check payment status');
      console.error('Payment check error:', err);
    }
  }, [expectedAmount, receiverAddress, tokenAddress, enabled]);

  useEffect(() => {
    if (!enabled) return;

    setPaymentStatus('pending');
    const intervalId = setInterval(checkPayment, pollInterval);

    // Initial check
    checkPayment();

    return () => clearInterval(intervalId);
  }, [checkPayment, enabled, pollInterval]);

  return {
    paymentStatus,
    transaction,
    error,
    checkPayment,
  };
}
