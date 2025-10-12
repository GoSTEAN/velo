"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/buttons";
import { Check, Clock, AlertCircle } from "lucide-react";

interface PaymentStatusProps {
  status: 'pending' | 'completed' | 'failed';
  amount: string;
  token: string;
  reference: string;
  onClose: () => void;
}

export default function PaymentStatus({
  status,
  amount,
  token,
  reference,
  onClose
}: PaymentStatusProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      title: 'Payment Pending',
      description: 'Waiting for your bank transfer'
    },
    completed: {
      icon: Check,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      title: 'Payment Completed',
      description: 'Your crypto has been delivered'
    },
    failed: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      title: 'Payment Failed',
      description: 'Please try again or contact support'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-card border-border/50">
      <div className="text-center space-y-4">
        <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mx-auto`}>
          <Icon className={`h-8 w-8 ${config.color}`} />
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {config.title}
          </h2>
          <p className="text-muted-foreground">
            {config.description}
          </p>
        </div>

        <Card className="p-4 bg-accent/20 border-border/50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{amount} {token}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <span className="font-mono text-xs">{reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-medium capitalize ${config.color}`}>
                {status}
              </span>
            </div>
          </div>
        </Card>

        {status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              Please complete your bank transfer within 24 hours. Your crypto will be delivered automatically once we receive your payment.
            </p>
          </div>
        )}

        <Button onClick={onClose} className="w-full">
          {status === 'pending' ? 'Track Payment' : 'Close'}
        </Button>
      </div>
    </Card>
  );
}