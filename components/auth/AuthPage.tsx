'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import VerifyForm from './VerifyForm';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';

export type AuthTab = 'login' | 'signup' | 'verify';

interface AuthPageProps {
    initialTab?: AuthTab;
}

export default function AuthPage({ initialTab = 'login' }: AuthPageProps) {
    const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
    const [email, setEmail] = useState<string>('');

    // Enhanced setActiveTab to accept optional email
    const handleSetActiveTab = (tab: AuthTab, emailArg?: string) => {
        setActiveTab(tab);
        if (emailArg) setEmail(emailArg);
    };

    return (
        <div className="w-full min-h-screen bg-background flex flex-col md:flex-row">
            {/* Left side - Branding */}
            <div className="w-full md:w-1/2 bg-nav flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <Image
                        src="/swiftLogo.svg"
                        alt="Swift Logo"
                        width={180}
                        height={60}
                        className="mb-8"
                    />
                    <h1 className="text-foreground text-custom-3xl font-bold mb-4">
                        Welcome to Swift
                    </h1>
                    <p className="text-muted-foreground text-custom-lg">
                        The fastest way to manage your crypto payments and
                        splits
                    </p>
                </div>
            </div>

            {/* Right side - Auth forms */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <Card className="w-full max-w-md p-8 border-none">
                    {activeTab === 'login' && (
                        <LoginForm setActiveTab={handleSetActiveTab} />
                    )}
                    {activeTab === 'signup' && (
                        <SignupForm setActiveTab={handleSetActiveTab} />
                    )}
                    {activeTab === 'verify' && (
                        <VerifyForm
                            setActiveTab={handleSetActiveTab}
                            email={email}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
}
