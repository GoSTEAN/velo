import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Plus, Camera, Edit3, Check, X, User, Mail, Phone, CreditCard, Shield, Settings } from 'lucide-react';

// Mock data for demonstration
const mockProfile = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    phoneNo: '+1234567890',
    linkedBankAccounts: [
        { name: 'Chase Bank', accNo: '****1234', bankId: 1 },
        { name: 'Wells Fargo', accNo: '****5678', bankId: 2 }
    ]
};

interface Bank {
    id: number;
    name: string;
    code: string;
    slug: string;
}

interface BankAccount {
    name: string;
    accNo: string;
    bankId: number;
}

interface UserProfile {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNo: string;
    linkedBankAccounts: BankAccount[];
}

export default function ProfileSettingsPage() {
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile>(mockProfile);
    const [formData, setFormData] = useState<UserProfile>(mockProfile);
    const [editMode, setEditMode] = useState(false);
    const [isKycVerified, setIsKycVerified] = useState(true);
    const [showBankForm, setShowBankForm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (field: keyof UserProfile, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setProfile(formData);
        setEditMode(false);
        // Here you would typically save to backend
    };

    const handleCancel = () => {
        setFormData(profile);
        setEditMode(false);
    };

    const handleAddBank = () => {
        setShowBankForm(true);
    };

    const handleRemoveBank = (index: number) => {
        const updatedAccounts = formData.linkedBankAccounts.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, linkedBankAccounts: updatedAccounts }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Settings className="w-6 h-6 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    </div>
                    <p className="text-gray-600">Manage your profile information and preferences</p>
                </div>

                {/* Profile Header Card */}
                <Card className="p-6 bg-white shadow-sm border-0 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Profile Picture */}
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                                    <img
                                        src={profilePic || '/api/placeholder/80/80'}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover bg-white"
                                    />
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-md transition-colors"
                                >
                                    <Camera size={12} />
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
                                            reader.onload = (ev) => setProfilePic(ev.target?.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>

                            {/* Basic Info */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {profile.firstName} {profile.lastName}
                                </h2>
                                <p className="text-gray-600 text-sm">@{profile.username}</p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <Shield size={14} className="text-green-600" />
                                    <span className="text-green-700 text-sm font-medium">KYC Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Edit Toggle */}
                        <button
                            onClick={() => editMode ? handleCancel() : setEditMode(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            <Edit3 size={14} />
                            {editMode ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                </Card>

                {/* Personal Information */}
                <Card className="p-6 bg-white shadow-sm border-0 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                disabled={!editMode}
                                className={`w-full p-3 rounded-lg border text-sm transition-colors ${
                                    editMode 
                                        ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200' 
                                        : 'border-gray-200 bg-gray-50'
                                } outline-none`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                disabled={!editMode}
                                className={`w-full p-3 rounded-lg border text-sm transition-colors ${
                                    editMode 
                                        ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200' 
                                        : 'border-gray-200 bg-gray-50'
                                } outline-none`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                disabled={!editMode}
                                className={`w-full p-3 rounded-lg border text-sm transition-colors ${
                                    editMode 
                                        ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200' 
                                        : 'border-gray-200 bg-gray-50'
                                } outline-none`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full p-3 pr-10 rounded-lg border border-gray-200 bg-gray-50 outline-none text-sm"
                                />
                                <Mail className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Phone Number (WhatsApp/Telegram)
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={formData.phoneNo}
                                    onChange={(e) => handleInputChange('phoneNo', e.target.value)}
                                    disabled={!editMode}
                                    className={`w-full p-3 pl-10 rounded-lg border text-sm transition-colors ${
                                        editMode 
                                            ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200' 
                                            : 'border-gray-200 bg-gray-50'
                                    } outline-none`}
                                />
                                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {editMode && (
                        <div className="flex gap-3 mt-6 justify-end">
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                <X size={14} />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            >
                                <Check size={14} />
                                Save Changes
                            </button>
                        </div>
                    )}
                </Card>

                {/* Financial Settings */}
                <Card className="p-6 bg-white shadow-sm border-0 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Bank Accounts</h3>
                        </div>
                        <button
                            onClick={handleAddBank}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            <Plus size={14} />
                            Add Bank
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.linkedBankAccounts.map((account, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 text-sm">{account.name}</h4>
                                        <p className="text-sm text-gray-600">{account.accNo}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveBank(index)}
                                    className="text-red-600 hover:text-red-800 transition-colors p-1"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        {formData.linkedBankAccounts.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No bank accounts linked</p>
                                <p className="text-xs text-gray-400">Add a bank account to get started</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* KYC Section */}
                <Card className="p-6 bg-white shadow-sm border-0 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Identity Verification</h3>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-green-900 text-sm">
                                    {isKycVerified ? 'Identity Verified' : 'Verification Required'}
                                </h4>
                                <p className="text-xs text-green-700">
                                    {isKycVerified 
                                        ? 'Your identity has been successfully verified' 
                                        : 'Complete KYC verification to unlock all features'
                                    }
                                </p>
                            </div>
                        </div>
                        {!isKycVerified && (
                            <button
                                onClick={() => window.location.href = '/kyc'}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
                            >
                                Start Verification
                            </button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}


// import React, { useState, useEffect } from 'react';
// import { Card } from '../ui/Card';
// import { Copy, Pencil, Plus } from 'lucide-react';
// import { shortenAddress, shortenName } from '../lib/utils';
// import { useAccount } from '@starknet-react/core';
// import {
//     getStoredProfile,
//     saveProfile,
//     getDefaultProfile,
//     UserProfile,
// } from '../lib/storage';
// import BankVerification from './bank-details';

// const copyToClipboard = async (text: string): Promise<boolean> => {
//     try {
//         await navigator.clipboard.writeText(text);
//         return true;
//     } catch (err) {
//         console.error('Failed to copy text: ', err);
//         return false;
//     }
// };

// interface Bank {
//     id: number;
//     name: string;
//     code: string;
//     slug: string;
// }

// export default function EditProfile() {
//     const [copiedAddress, setCopiedAddress] = useState(false);
//     const [edit, setEdit] = useState(false);
//     const [profile, setProfile] = useState<UserProfile>(getDefaultProfile());
//     const [formData, setFormData] = useState<UserProfile>(getDefaultProfile());
//     const [apiMessage, setApiMessage] = useState<string | null>(null);
//     const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
//     const [showBankVerification, setShowBankVerification] = useState(false);

//     const { address } = useAccount();

//     // Load saved profile on component mount
//     // Fetch profile from backend on mount
//     useEffect(() => {
//         const fetchProfile = async () => {
//             setApiMessage(null);
//             try {
//                 const token = localStorage.getItem('authToken');
//                 const res = await fetch(
//                     'https://velo-node-backend.onrender.com/user/profile',
//                     {
//                         method: 'GET',
//                         headers: {
//                             'Content-Type': 'application/json',
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );
//                 const data = await res.json();
//                 if (res.ok) {
//                     setProfile(data);
//                     setFormData(data);
//                 } else {
//                     setApiMessage(data.error || 'Failed to fetch profile.');
//                 }
//             } catch (err) {
//                 setApiMessage('Network error.');
//             }
//         };
//         fetchProfile();
//     }, []);

//     const handleEdit = () => {
//         setEdit(!edit);
//     };

//     const handleInputChange = (
//         field: keyof UserProfile,
//         value: string | boolean
//     ) => {
//         setFormData((prev) => ({
//             ...prev,
//             [field]: value,
//         }));
//     };

//     const handleSave = () => {
//         saveProfile(formData);
//         setProfile(formData);
//         setEdit(false);
//         window.dispatchEvent(new Event('profileUpdated'));
//         const handleSave = async () => {
//             setApiMessage(null);
//             try {
//                 const token = localStorage.getItem('authToken');
//                 const res = await fetch(
//                     'https://velo-node-backend.onrender.com/user/profile',
//                     {
//                         method: 'PUT',
//                         headers: {
//                             'Content-Type': 'application/json',
//                             Authorization: `Bearer ${token}`,
//                         },
//                         body: JSON.stringify({
//                             firstName: formData.firstName,
//                             lastName: formData.lastName,
//                             phoneNumber: formData.phoneNo,
//                         }),
//                     }
//                 );
//                 const data = await res.json();
//                 if (res.ok) {
//                     setProfile({ ...profile, ...data });
//                     setFormData({ ...formData, ...data });
//                     setEdit(false);
//                     setApiMessage('Profile updated successfully.');
//                     window.dispatchEvent(new Event('profileUpdated'));
//                 } else {
//                     setApiMessage(data.error || 'Failed to update profile.');
//                 }
//             } catch (err) {
//                 setApiMessage('Network error.');
//             }
//         };
//     };

//     const handleCancel = () => {
//         setFormData(profile);
//         setEdit(false);
//     };

//     const handleAddBankAccount = () => {
//         setSelectedBank(null);
//         setShowBankVerification(true);
//     };

//     const handleBankVerified = (verificationResult: any) => {
//         // Add the verified bank account to the form data
//         const newAccount = {
//             name: verificationResult.account_name,
//             accNo: verificationResult.account_number,
//             bankId: verificationResult.bank_id,
//         };

//         setFormData((prev) => ({
//             ...prev,
//             linkedBankAccounts: [...prev.linkedBankAccounts, newAccount],
//         }));

//         setShowBankVerification(false);
//     };

//     const handleCopyAddress = async () => {
//         if (!address) return;
//         const success = await copyToClipboard(address);
//         if (success) {
//             setCopiedAddress(true);
//             setTimeout(() => setCopiedAddress(false), 2000);
//         }
//     };

//     const defaultCurrencyOptions = ['USD', 'NGN', 'EUR'];

//     return (
//         <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] pl-5 relative ">
//             <div className="flex flex-col gap-[24px]">
//                 <h1 className="text-muted-foreground text-custom-lg">
//                     Edit Profile
//                 </h1>
//                 <div className=" w-full flex flex-col gap-[12px]">
//                     <Card className="flex w-full flex-col lg:flex-row p-[24px] border-none">
//                         <div className="w-full flex flex-col gap-[14px]">
//                             <h1 className="text-muted-foreground text-custom-lg">
//                                 Personal Information
//                             </h1>
//                             {/* First Name */}
//                             <div className="w-full flex flex-col gap-[10px] p-[8px]">
//                                 <label
//                                     htmlFor="firstName"
//                                     className="text-muted-foreground text-custom-sm"
//                                 >
//                                     First Name
//                                 </label>
//                                 <div
//                                     className={`$${
//                                         edit ? 'border border-[#2F80ED]' : ''
//                                     } flex w-full items-center px-2 text-muted-muted-foreground bg-background rounded-[12px] outline-none`}
//                                 >
//                                     <input
//                                         id="firstName"
//                                         type="text"
//                                         value={formData.firstName || ''}
//                                         onChange={(e) =>
//                                             handleInputChange(
//                                                 'firstName',
//                                                 e.target.value
//                                             )
//                                         }
//                                         disabled={!edit}
//                                         className="w-full p-[12px] bg-transparent outline-none"
//                                     />
//                                 </div>
//                             </div>
//                             {/* Last Name */}
//                             <div className="w-full flex flex-col gap-[10px] p-[8px]">
//                                 <label
//                                     htmlFor="lastName"
//                                     className="text-muted-foreground text-custom-sm"
//                                 >
//                                     Last Name
//                                 </label>
//                                 <div
//                                     className={`$${
//                                         edit ? 'border border-[#2F80ED]' : ''
//                                     } flex w-full items-center px-2 text-muted-muted-foreground bg-background rounded-[12px] outline-none`}
//                                 >
//                                     <input
//                                         id="lastName"
//                                         type="text"
//                                         value={formData.lastName || ''}
//                                         onChange={(e) =>
//                                             handleInputChange(
//                                                 'lastName',
//                                                 e.target.value
//                                             )
//                                         }
//                                         disabled={!edit}
//                                         className="w-full p-[12px] bg-transparent outline-none"
//                                     />
//                                 </div>
//                             </div>
//                             {/* Email (static) */}
//                             <div className="w-full flex flex-col gap-[10px] p-[8px]">
//                                 <label
//                                     htmlFor="email"
//                                     className="text-muted-foreground text-custom-sm"
//                                 >
//                                     Email
//                                 </label>
//                                 <div className="flex w-full items-center px-2 text-muted-muted-foreground bg-background rounded-[12px] outline-none">
//                                     <input
//                                         id="email"
//                                         type="email"
//                                         value={formData.email}
//                                         disabled
//                                         readOnly
//                                         className="w-full p-[12px] bg-transparent outline-none cursor-not-allowed"
//                                     />
//                                 </div>
//                             </div>
//                             {/* Number */}
//                             <div className="w-full flex flex-col gap-[10px] p-[8px]">
//                                 <label
//                                     htmlFor="phoneNo"
//                                     className="text-muted-foreground text-custom-sm"
//                                 >
//                                     Number
//                                 </label>
//                                 <div
//                                     className={`$${
//                                         edit ? 'border border-[#2F80ED]' : ''
//                                     } flex w-full items-center px-2 text-muted-muted-foreground bg-background rounded-[12px] outline-none`}
//                                 >
//                                     <input
//                                         id="phoneNo"
//                                         type="tel"
//                                         value={formData.phoneNo}
//                                         onChange={(e) =>
//                                             handleInputChange(
//                                                 'phoneNo',
//                                                 e.target.value
//                                             )
//                                         }
//                                         disabled={!edit}
//                                         className="w-full p-[12px] bg-transparent outline-none"
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="w-full h-2 lg:w-2 lg:h-full bg-background"></div>
//                         <div className="w-full flex flex-col gap-[14px]">
//                             <h1 className="text-muted-foreground text-custom-lg">
//                                 Wallet Details
//                             </h1>
//                             <div className="w-full flex flex-col gap-[10px] p-[8px]">
//                                 <label className="text-muted-foreground text-custom-sm">
//                                     Connected wallet
//                                 </label>
//                                 <div className="p-[12px] flex gap-[8px] ">
//                                     <div className="p-[8px] bg-button text-button text-custom-sm font-bold rounded-[7px]">
//                                         Raady Wallet
//                                     </div>
//                                     <div className="p-[8px] bg-button text-button text-custom-sm font-bold rounded-[7px]">
//                                         Bravos Wallet
//                                     </div>
//                                     <div className="p-[8px] bg-button text-button text-custom-sm font-bold rounded-[7px]">
//                                         MetaMax
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="w-full flex flex-col gap-[10px] p-[8px]">
//                                 <label className="text-muted-foreground text-custom-sm">
//                                     Wallet Address
//                                 </label>
//                                 <div className="flex w-full justify-between p-[15px] ">
//                                     <div className="text-muted-foreground w-full text-custom-md font-black">
//                                         {shortenAddress(address, 12)}
//                                     </div>
//                                     <div className="flex gap-2 ">
//                                         <button
//                                             onClick={handleCopyAddress}
//                                             className="text-muted-muted-foreground cursor-pointer text-[14px] "
//                                             title="Copy address"
//                                         >
//                                             {copiedAddress ? (
//                                                 '✓'
//                                             ) : (
//                                                 <Copy size={16} />
//                                             )}
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="w-full flex flex-col gap-[10px] p-[8px]">
//                                 <label className="text-muted-foreground text-custom-sm">
//                                     Default Currency
//                                 </label>
//                                 <div className="p-[12px] flex gap-[8px] ">
//                                     {defaultCurrencyOptions.map((cur) => (
//                                         <button
//                                             key={cur}
//                                             onClick={() =>
//                                                 handleInputChange(
//                                                     'defaultCurrency',
//                                                     cur
//                                                 )
//                                             }
//                                             className={`p-[8px] text-custom-sm font-bold rounded-[7px] ${
//                                                 formData.defaultCurrency === cur
//                                                     ? 'bg-button text-button'
//                                                     : ' border text-muted-foreground '
//                                             }`}
//                                         >
//                                             {cur}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </Card>

//                     <Card className="flex w-full flex-col lg:flex-row p-[24px] border-none">
//                         <div className="w-full flex flex-col gap-[10px] p-[8px]">
//                             <h1 className="text-muted-foreground text-custom-lg">
//                                 Security
//                             </h1>
//                             <label className="text-foreground text-custom-md">
//                                 Two-factor authentication
//                             </label>
//                             <div className="flex w-full justify-between">
//                                 <div className="text-muted-foreground w-full text-custom-sm">
//                                     add an extra layer of security
//                                 </div>
//                                 <button
//                                     onClick={() =>
//                                         handleInputChange(
//                                             'enable2FA',
//                                             !formData.enable2FA
//                                         )
//                                     }
//                                     className={`cursor-pointer ${
//                                         formData.enable2FA
//                                             ? 'bg-[#1A2B49]'
//                                             : 'bg-[#C1C9D3] '
//                                     } h-[21px] rounded-[15px] transition-all duration-300 flex items-center w-[40px]`}
//                                 >
//                                     <div
//                                         className={`${
//                                             formData.enable2FA
//                                                 ? 'bg-[#2F80ED]'
//                                                 : 'bg-[#F7F9FC]'
//                                         } w-[17px] h-[17px] rounded-[36px] transition-all duration-300 transform ${
//                                             formData.enable2FA
//                                                 ? 'translate-x-5'
//                                                 : 'translate-x-1'
//                                         }`}
//                                     ></div>
//                                 </button>
//                             </div>
//                         </div>
//                         <div className="w-full flex flex-col gap-[10px] p-[8px]">
//                             <h1 className="text-muted-foreground text-custom-lg">
//                                 Financial settings
//                             </h1>
//                             <div className="flex flex-col w-full relative gap-[8px]">
//                                 <div className="text-muted-foreground w-full text-custom-sm">
//                                     Linked bank accounts
//                                 </div>
//                                 <div className="flex gap-2 flex-wrap">
//                                     {formData.linkedBankAccounts.map(
//                                         (acc, id) => (
//                                             <div
//                                                 key={id}
//                                                 className="flex gap-[8px] items-center p-2 bg-background rounded-lg"
//                                             >
//                                                 <p className="p-2 bg-button text-button text-custom-md font-bold rounded-full">
//                                                     {shortenName(acc.name)}
//                                                 </p>
//                                                 <div className="flex flex-col">
//                                                     <h1 className="text-custom-sm text-foreground font-semibold">
//                                                         {acc.name}
//                                                     </h1>
//                                                     <p className="text-muted-foreground text-custom-xs">
//                                                         {shortenAddress(
//                                                             acc.accNo,
//                                                             2
//                                                         )}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         )
//                                     )}
//                                     <button
//                                         onClick={handleAddBankAccount}
//                                         className="bg-background border cursor-pointer border-border p-2 text-foreground rounded-[7px]"
//                                     >
//                                         <Plus />
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </Card>

//                     <Card className="flex w-full flex-col lg:flex-row p-[24px] border-none">
//                         <div className="w-full flex flex-col gap-[10px] p-[8px]">
//                             <h1 className="text-muted-foreground text-custom-lg">
//                                 Preferences
//                             </h1>
//                             <div className="flex justify-between items-center">
//                                 <h1 className="text-muted-foreground text-custom-md">
//                                     Transaction Notifications
//                                 </h1>
//                                 <button
//                                     onClick={() =>
//                                         handleInputChange(
//                                             'transactionNotifications',
//                                             !formData.transactionNotifications
//                                         )
//                                     }
//                                     className={`cursor-pointer ${
//                                         formData.transactionNotifications
//                                             ? 'bg-[#1A2B49] '
//                                             : 'bg-[#C1C9D3] '
//                                     } h-[21px] rounded-[15px] transition-all duration-300 flex items-center w-[40px]`}
//                                 >
//                                     <div
//                                         className={`${
//                                             formData.transactionNotifications
//                                                 ? 'bg-[#2F80ED]'
//                                                 : 'bg-[#F7F9FC]'
//                                         } w-[17px] h-[17px] rounded-[36px] transition-all duration-300 transform ${
//                                             formData.transactionNotifications
//                                                 ? 'translate-x-5 '
//                                                 : 'translate-x-1'
//                                         }`}
//                                     ></div>
//                                 </button>
//                             </div>
//                             <div className="flex justify-between items-center">
//                                 <div className="text-muted-foreground text-custom-md">
//                                     Dark mode
//                                 </div>
//                                 <button
//                                     onClick={() =>
//                                         handleInputChange(
//                                             'darkMode',
//                                             !formData.darkMode
//                                         )
//                                     }
//                                     className={`cursor-pointer ${
//                                         formData.darkMode
//                                             ? 'bg-[#1A2B49]'
//                                             : 'bg-[#C1C9D3] '
//                                     } h-[21px] rounded-[15px] transition-all duration-300 flex items-center w-[40px]`}
//                                 >
//                                     <div
//                                         className={`${
//                                             formData.darkMode
//                                                 ? 'bg-[#2F80ED]'
//                                                 : 'bg-[#F7F9FC]'
//                                         } w-[17px] h-[17px] rounded-[36px] transition-all duration-300 transform ${
//                                             formData.darkMode
//                                                 ? 'translate-x-5'
//                                                 : 'translate-x-1'
//                                         }`}
//                                     ></div>
//                                 </button>
//                             </div>
//                         </div>
//                     </Card>

//                     <div className="w-full flex justify-between gap-4">
//                         <button
//                             onClick={handleSave}
//                             className="rounded-[7px] max-w-[200px] p-[16px_32px] bg-button hover:bg-hover text-button cursor-pointer w-full"
//                         >
//                             Save
//                         </button>
//                         <button
//                             onClick={handleCancel}
//                             className="w-full max-w-[200px] rounded-[12px] duration-200 transition-colors bg-white border border-[#2F80ED] text-[#2F80ED] hover:bg-hover hover:text-hover font-bold p-[16px_32px]"
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             <BankVerification
//                 show={showBankVerification}
//                 selectedBank={selectedBank}
//                 setSelectedBank={setSelectedBank}
//                 onClose={() => setShowBankVerification(false)}
//                 onBankVerified={handleBankVerified}
//             />
//         </div>
//     );
// }
