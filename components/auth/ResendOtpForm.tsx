// components/auth/ResendOtpForm.tsx

'use client';

import React, { useState } from 'react';

interface ResendOtpFormProps {
    email: string;
    onResent?: (message: string) => void;
}

export default function ResendOtpForm({ email, onResent }: ResendOtpFormProps) {
    const [apiMessage, setApiMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiMessage(null);
        setLoading(true);
        try {
            const res = await fetch(
                'https://velo-node-backend.onrender.com/auth/resend-otp',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                }
            );
            const data = await res.json();
            if (res.ok) {
                setApiMessage(data.message || 'OTP resent successfully!');
                if (onResent)
                    onResent(data.message || 'OTP resent successfully!');
            } else {
                setApiMessage(data.error || 'Failed to resend OTP.');
            }
        } catch {
            setApiMessage('Network error. Please try again.');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleResend} className="space-y-4">
            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[12px] bg-button text-button font-bold hover:bg-hover duration-200 transition-colors p-4"
            >
                {loading ? 'Resending...' : 'Resend OTP'}
            </button>
            {apiMessage && (
                <div className="text-center text-red-500 text-sm mt-2">
                    {apiMessage}
                </div>
            )}
        </form>
    );
}
