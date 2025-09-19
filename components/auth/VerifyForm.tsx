// components/auth/VerifyForm.tsx
'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthTab, EncryptedWalletData } from './AuthPage';
import { useAuth } from '@/components/context/AuthContext';

interface VerifyFormProps {
    setActiveTab: (tab: AuthTab, email?: string) => void;
    email: string;
    walletData?: EncryptedWalletData | null;
}

export default function VerifyForm({
    setActiveTab,
    email,
    walletData,
}: VerifyFormProps) {
    const [apiMessage, setApiMessage] = useState<string | null>(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const { verifyOtp, resendOtp } = useAuth();

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
            const result = await verifyOtp(email, verificationCode);
            if (result.success) {
                setApiMessage(result.message || 'Verification successful!');
                // Redirect to login after successful verification
                setTimeout(() => {
                    setActiveTab('login', email);
                }, 1000);
            }
        } catch (err) {
            setApiMessage(err instanceof Error ? err.message : 'Verification failed.');
        }
    };

    const [resendLoading, setResendLoading] = useState(false);
    const handleResend = async () => {
        setApiMessage(null);
        setResendLoading(true);
        try {
            const result = await resendOtp(email);
            if (result.success) {
                setApiMessage(result.message || 'OTP resent successfully!');
            }
        } catch (err) {
            setApiMessage(err instanceof Error ? err.message : 'Failed to resend OTP.');
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