import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Plus, Camera } from 'lucide-react';
import BankVerification from './bank-details';
import { getDefaultProfile, UserProfile } from '../lib/storage';
import Image from 'next/image';

// interface VerificationResult {
//     account_number: string;
//     account_name: string;
//     bank_id: number;
// }
// interface BankVerificationProps {
//     show: boolean;
//     selectedBank: Bank | null;
//     setSelectedBank: React.Dispatch<React.SetStateAction<Bank | null>>;
//     onClose: () => void;
//     onBankVerified: (result: VerificationResult) => void;
// }

interface Bank {
    id: number;
    name: string;
    code: string;
    slug: string;
}
export default function ProfilePage() {
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // const [edit, setEdit] = useState(false);
    const [profile, setProfile] = useState<UserProfile>(getDefaultProfile());
    const [formData, setFormData] = useState<UserProfile>(getDefaultProfile());
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [showBankVerification, setShowBankVerification] = useState(false);
     const url = process.env.NEXT_PUBLIC_BACKEND_URL
console.log(profile)
    useEffect(() => {
        // Fetch profile from backend on mount
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch(
                   ` ${url}/user/profile`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await res.json();
                if (res.ok) {
                    setProfile(data);
                    setFormData(data);
                }
            } catch (err) {
                console.log(err)
            }
        };
        fetchProfile();
    }, []);

    // const handleInputChange = (field: keyof UserProfile, value: any) => {
    //     setFormData((prev) => ({ ...prev, [field]: value }));
    // };

    const handleAddBankAccount = () => {
        setSelectedBank(null);
        setShowBankVerification(true);
    };

    const handleBankVerified = (verificationResult: any) => {
        const newAccount = {
            name: verificationResult.account_name,
            accNo: verificationResult.account_number,
            bankId: verificationResult.bank_id,
        };
        setFormData((prev) => ({
            ...prev,
            linkedBankAccounts: [...prev.linkedBankAccounts, newAccount],
        }));
        setShowBankVerification(false);
    };

    return (
        <div className="w-full h-full min-h-screen bg-gradient-to-br from-[#e0e7ff] to-[#f4f8ff] transition-all duration-300 p-4 md:p-8 flex flex-col items-center">
            <div className="flex flex-col gap-10 max-w-3xl w-full">
                <h1 className="text-5xl font-extrabold text-center text-[#22223b] mb-4 tracking-tight drop-shadow-lg">
                    Profile
                </h1>
                <Card className="flex flex-col md:flex-row gap-10 p-12 border-none items-center bg-white/90 shadow-2xl rounded-2xl">
                    <div className="flex flex-col items-center gap-6 md:w-1/3 w-full">
                        <div className="relative w-40 h-40">
                            <Image
                                src={profilePic || '/default-profile.png'}
                                alt="Profile"
                                fill
                                className="rounded-full object-cover w-40 h-40 border-4 border-[#4895ef] shadow-xl bg-[#e0e7ff]"
                            />
                            <button
                                type="button"
                                className="absolute bottom-3 right-3 bg-[#4895ef] text-white rounded-full p-3 shadow-lg hover:bg-[#4361ee] transition"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera size={22} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) =>
                                            setProfilePic(
                                                ev.target?.result as string
                                            );
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>
                        <div className="flex flex-col items-center gap-1 mt-2">
                            <span className="text-[#22223b] text-xl font-bold tracking-wide">
                                KYC Status
                            </span>
                            <button
                                className="px-6 py-2 mt-1 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-extrabold text-lg shadow-lg hover:from-blue-400 hover:to-green-400 transition border-2 border-[#4895ef]"
                                onClick={() => (window.location.href = '/kyc')}
                                title="Go to KYC page"
                            >
                                Verified
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block text-[#22223b] text-lg font-bold mb-2 tracking-wide"
                            >
                                First Name
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                value={formData.firstName || ''}
                                disabled
                                className="w-full p-4 bg-[#f4f8ff] border-2 border-[#4895ef] rounded-xl outline-none font-semibold text-[#22223b] text-lg shadow-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="lastName"
                                className="block text-[#22223b] text-lg font-bold mb-2 tracking-wide"
                            >
                                Last Name
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                value={formData.lastName || ''}
                                disabled
                                className="w-full p-4 bg-[#f4f8ff] border-2 border-[#4895ef] rounded-xl outline-none font-semibold text-[#22223b] text-lg shadow-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-[#22223b] text-lg font-bold mb-2 tracking-wide"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={formData.username || ''}
                                disabled
                                className="w-full p-4 bg-[#f4f8ff] border-2 border-[#4895ef] rounded-xl outline-none font-semibold text-[#22223b] text-lg shadow-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-[#22223b] text-lg font-bold mb-2 tracking-wide"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                disabled
                                readOnly
                                className="w-full p-4 bg-[#f4f8ff] border-2 border-[#4895ef] rounded-xl outline-none font-semibold text-[#22223b] text-lg shadow-sm cursor-not-allowed"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label
                                htmlFor="phoneNo"
                                className="block text-[#22223b] text-lg font-bold mb-2 tracking-wide"
                            >
                                Number (TG/WhatsApp)
                            </label>
                            <input
                                id="phoneNo"
                                type="tel"
                                value={formData.phoneNo}
                                disabled
                                className="w-full p-4 bg-[#f4f8ff] border-2 border-[#4895ef] rounded-xl outline-none font-semibold text-[#22223b] text-lg shadow-sm"
                            />
                        </div>
                    </div>
                </Card>
                <Card className="flex flex-col gap-4 p-10 border-none bg-white/80 shadow-lg">
                    <h1 className="text-2xl text-[#22223b] font-semibold mb-2 text-center">
                        Financial settings
                    </h1>
                    <div className="flex flex-col w-full relative gap-4">
                        <div className="text-[#22223b] w-full text-base mb-2">
                            Linked bank accounts
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {formData.linkedBankAccounts &&
                                formData.linkedBankAccounts.map((acc, id) => (
                                    <div
                                        key={id}
                                        className="flex gap-2 items-center p-2 bg-[#f4f8ff] rounded-lg border border-[#a3cef1]"
                                    >
                                        <p className="p-2 bg-[#4895ef] text-white text-base font-bold rounded-full">
                                            {acc.name}
                                        </p>
                                        <div className="flex flex-col">
                                            <h1 className="text-base text-[#22223b] font-semibold">
                                                {acc.name}
                                            </h1>
                                            <p className="text-[#4361ee] text-xs">
                                                {acc.accNo}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            <button
                                onClick={handleAddBankAccount}
                                className="bg-[#f4f8ff] border border-[#a3cef1] cursor-pointer p-2 text-[#22223b] rounded-lg hover:bg-[#a3cef1] transition"
                            >
                                <Plus />
                            </button>
                        </div>
                    </div>
                </Card>
                <BankVerification
                    show={showBankVerification}
                    selectedBank={selectedBank}
                    setSelectedBank={setSelectedBank}
                    onClose={() => setShowBankVerification(false)}
                    onBankVerified={handleBankVerified}
                />
            </div>
        </div>
    );
}
