// components/auth/SignupForm.tsx
'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { AuthTab } from './AuthPage';
// import { EncryptedWalletData } from '@/components/lib/utils/walletGenerator';
import { useAuth } from '@/components/context/AuthContext';

interface SignupFormProps {
    setActiveTab: (
        tab: AuthTab,
        email?: string,
        // walletData?: EncryptedWalletData
    ) => void;
}

export default function SignupForm({ setActiveTab }: SignupFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        agreeToTerms: false,
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.agreeToTerms) {
            alert('You must agree to the terms and conditions');
            return;
        }

        setIsGenerating(true);
        try {
            const result = await register(formData.email, formData.password);
            if (result.success) {
                setActiveTab('verify', formData.email);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(error instanceof Error ? error.message : 'Registration failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-foreground text-custom-2xl font-bold mb-6">
                Create an account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="signup-email"
                        className="text-foreground text-custom-sm"
                    >
                        Email
                    </label>
                    <div className="relative">
                        <Mail
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            size={20}
                        />
                        <input
                            id="signup-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            placeholder="Enter your email"
                            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-[7px] outline-none focus:border-[#2F80ED] text-foreground"
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="signup-password"
                        className="text-foreground text-custom-sm"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <Lock
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            size={20}
                        />
                        <input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                            placeholder="Create a password"
                            className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-[7px] outline-none focus:border-[#2F80ED] text-foreground"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="agreeToTerms"
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                agreeToTerms: e.target.checked,
                            })
                        }
                        className="w-4 h-4 text-[#2F80ED] bg-background border-border rounded focus:ring-[#2F80ED]"
                        required
                    />
                    <label
                        htmlFor="agreeToTerms"
                        className="text-muted-foreground text-custom-sm"
                    >
                        I agree to the Terms and Conditions
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full rounded-[12px] bg-button text-button font-bold hover:bg-hover disabled:opacity-50 duration-200 transition-colors p-4"
                >
                    {isGenerating
                        ? 'Generating Secure Wallets...'
                        : 'Create Account'}
                </button>

                <div className="text-center">
                    <p className="text-muted-foreground text-custom-sm">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => setActiveTab('login')}
                            className="text-[#2F80ED] hover:underline font-medium"
                        >
                            Login
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
}