'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthTab } from './AuthPage';

interface VerifyFormProps {
    setActiveTab: (tab: AuthTab, email?: string) => void;
    email: string;
}

export default function VerifyForm({ setActiveTab, email }: VerifyFormProps) {
    const [apiMessage, setApiMessage] = useState<string | null>(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiMessage(null);
        const verificationCode = otp.join('');
        try {
            const res = await fetch(
                'https://velo-node-backend.onrender.com/auth/verify-otp',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        otp: verificationCode,
                    }),
                }
            );
            const data = await res.json();
            if (res.ok) {
                setApiMessage(data.message || 'Verification successful!');
                // You can handle token or redirect here
            } else {
                setApiMessage(data.error || 'Verification failed.');
            }
        } catch (err) {
            setApiMessage('Network error. Please try again.');
        }
    };

    const [resendLoading, setResendLoading] = useState(false);
    const handleResend = async () => {
        setApiMessage(null);
        setResendLoading(true);
        try {
            const res = await fetch(
                'https://velo-node-backend.onrender.com/auth/resend-otp',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email }),
                }
            );
            const data = await res.json();
            if (res.ok) {
                setApiMessage(data.message || 'OTP resent successfully!');
            } else {
                setApiMessage(data.error || 'Failed to resend OTP.');
            }
        } catch (err) {
            setApiMessage('Network error. Please try again.');
        }
        setResendLoading(false);
    };

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className="flex items-center text-muted-foreground mb-6 hover:text-foreground"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back
            </button>

            <h2 className="text-foreground text-custom-2xl font-bold mb-2">
                Verify your email
            </h2>
            <p className="text-muted-foreground text-custom-sm mb-6">
                We&apos;ve sent a 6-digit code to your email. Enter it below to
                continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {apiMessage && (
                    <div className="text-center text-red-500 text-sm mb-2">
                        {apiMessage}
                    </div>
                )}
                <div className="flex justify-between gap-2">
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={data}
                            onChange={(e) =>
                                handleChange(
                                    e.target as HTMLInputElement,
                                    index
                                )
                            }
                            onFocus={(e) => e.target.select()}
                            className="w-12 h-12 text-center bg-background border border-border rounded-[7px] outline-none focus:border-[#2F80ED] text-foreground text-custom-xl"
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    className="w-full rounded-[12px] bg-button text-button font-bold hover:bg-hover duration-200 transition-colors p-4"
                >
                    Verify Account
                </button>

                <div className="text-center">
                    <p className="text-muted-foreground text-custom-sm">
                        Didn&apos;t receive the code?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            className="text-[#2F80ED] hover:underline font-medium"
                            disabled={resendLoading}
                        >
                            {resendLoading ? 'Resending...' : 'Resend code'}
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
}
