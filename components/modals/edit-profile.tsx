import React, { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Copy, Pencil, Plus } from "lucide-react";
import { shortenAddress, shortenName } from "../lib/utils";
import { useAccount } from "@starknet-react/core";
import {
  getStoredProfile,
  saveProfile,
  getDefaultProfile,
  UserProfile,
} from "../lib/storage";

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
};

export default function EditProfile() {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [edit, setEdit] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(getDefaultProfile());
  const [formData, setFormData] = useState<UserProfile>(getDefaultProfile());

  const { address } = useAccount();

  // Load saved profile on component mount
  useEffect(() => {
    const savedProfile = getStoredProfile();
    if (savedProfile) {
      setProfile(savedProfile);
      setFormData(savedProfile);
    }
  }, []);

  const handleEdit = () => {
    setEdit(!edit);
  };

  const handleInputChange = (
    field: keyof UserProfile,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    saveProfile(formData);
    setProfile(formData);
    setEdit(false);
    // You can also emit an event or use context to notify other components
    window.dispatchEvent(new Event("profileUpdated"));
  };

  const handleCancel = () => {
    setFormData(profile);
    setEdit(false);
  };

  const handleAddBankAccount = () => {
    const newAccount = { name: "New Bank", accNo: "0000000000" };
    setFormData((prev) => ({
      ...prev,
      linkedBankAccounts: [...prev.linkedBankAccounts, newAccount],
    }));
  };

  const handleCopyAddress = async () => {
    if (!address) return;
    const success = await copyToClipboard(address);
    if (success) {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const defaultCurrencyOptions = ["USD", "NGN", "EUR"];

  return (
    <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] pl-5 relative ">
      <div className="flex flex-col gap-[24px]">
        <h1 className="text-muted-foreground text-custom-lg">Edit Profile</h1>
        <div className=" w-full flex flex-col gap-[12px]">
          <Card className="flex w-full flex-col lg:flex-row p-[24px] border-none">
            <div className="w-full flex flex-col gap-[14px]">
              <h1 className="text-muted-foreground text-custom-lg">
                Personal Information
              </h1>
              <div className="w-full flex flex-col gap-[10px] p-[8px]">
                <label
                  htmlFor="username"
                  className="text-muted-foreground text-custom-sm"
                >
                  User Name
                </label>
                <div
                  className={`${
                    edit ? "border border-[#2F80ED]" : ""
                  } flex w-full items-center px-2 text-muted-muted-foreground bg-background rounded-[12px] outline-none`}
                >
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    disabled={!edit}
                    className="w-full p-[12px] bg-transparent outline-none"
                  />
                  <button onClick={handleEdit} className="w-fit cursor-pointer">
                    <Pencil
                      size={14}
                      className={
                        edit
                          ? "text-foreground stroke-3"
                          : "text-muted-foreground"
                      }
                    />
                  </button>
                </div>
              </div>
              <div className="w-full flex flex-col gap-[10px] p-[8px]">
                <label
                  htmlFor="email"
                  className="text-muted-foreground text-custom-sm"
                >
                  Email
                </label>
                <div
                  className={`${
                    edit ? "border border-[#2F80ED]" : ""
                  } flex w-full items-center px-2 text-muted-muted-foreground bg-background rounded-[12px] outline-none`}
                >
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!edit}
                    className="w-full p-[12px] bg-transparent outline-none"
                  />
                  <button onClick={handleEdit} className="w-fit cursor-pointer">
                    <Pencil
                      size={14}
                      className={
                        edit
                          ? "text-foreground stroke-3"
                          : "text-muted-foreground"
                      }
                    />
                  </button>
                </div>
              </div>
              <div className="w-full flex flex-col gap-[10px] p-[8px]">
                <label
                  htmlFor="phoneNo"
                  className="text-muted-foreground text-custom-sm"
                >
                  Number
                </label>
                <div
                  className={`${
                    edit ? "border border-[#2F80ED]" : ""
                  } flex w-full items-center px-2 text-muted-muted-foreground bg-background rounded-[12px] outline-none`}
                >
                  <input
                    id="phoneNo"
                    type="tel"
                    value={formData.phoneNo}
                    onChange={(e) =>
                      handleInputChange("phoneNo", e.target.value)
                    }
                    disabled={!edit}
                    className="w-full p-[12px] bg-transparent outline-none"
                  />
                  <button onClick={handleEdit} className="w-fit cursor-pointer">
                    <Pencil
                      size={14}
                      className={
                        edit
                          ? "text-foreground stroke-3"
                          : "text-muted-foreground"
                      }
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full h-2 lg:w-2 lg:h-full bg-background"></div>
            <div className="w-full flex flex-col gap-[14px]">
              <h1 className="text-muted-foreground text-custom-lg">
                Wallet Details
              </h1>
              <div className="w-full flex flex-col gap-[10px] p-[8px]">
                <label className="text-muted-foreground text-custom-sm">
                  Connected wallet
                </label>
                <div className="p-[12px] flex gap-[8px] ">
                  <div className="p-[8px] bg-button text-button text-custom-sm font-bold rounded-[7px]">
                    Raady Wallet
                  </div>
                  <div className="p-[8px] bg-button text-button text-custom-sm font-bold rounded-[7px]">
                    Bravos Wallet
                  </div>
                  <div className="p-[8px] bg-button text-button text-custom-sm font-bold rounded-[7px]">
                    MetaMax
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col gap-[10px] p-[8px]">
                <label className="text-muted-foreground text-custom-sm">
                  Wallet Address
                </label>
                <div className="flex w-full justify-between p-[15px] ">
                  <div className="text-muted-foreground w-full text-custom-md font-black">
                    {shortenAddress(address, 12)}
                  </div>
                  <div className="flex gap-2 ">
                    <button
                      onClick={handleCopyAddress}
                      className="text-muted-muted-foreground cursor-pointer text-[14px] "
                      title="Copy address"
                    >
                      {copiedAddress ? "✓" : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col gap-[10px] p-[8px]">
                <label className="text-muted-foreground text-custom-sm">
                  Default Currency
                </label>
                <div className="p-[12px] flex gap-[8px] ">
                  {defaultCurrencyOptions.map((cur) => (
                    <button
                      key={cur}
                      onClick={() => handleInputChange("defaultCurrency", cur)}
                      className={`p-[8px] text-custom-sm font-bold rounded-[7px] ${
                        formData.defaultCurrency === cur
                          ? "bg-button text-button"
                          : " border text-muted-foreground "
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex w-full flex-col lg:flex-row p-[24px] border-none">
            <div className="w-full flex flex-col gap-[10px] p-[8px]">
              <h1 className="text-muted-foreground text-custom-lg">Security</h1>
              <label className="text-foreground text-custom-md">
                Two-factor authentication
              </label>
              <div className="flex w-full justify-between">
                <div className="text-muted-foreground w-full text-custom-sm">
                  add an extra layer of security
                </div>
                <button
                  onClick={() =>
                    handleInputChange("enable2FA", !formData.enable2FA)
                  }
                  className={`cursor-pointer ${
                    formData.enable2FA ? "bg-[#1A2B49]" : "bg-[#C1C9D3] "
                  } h-[21px] rounded-[15px] transition-all duration-300 flex items-center w-[40px]`}
                >
                  <div
                    className={`${
                      formData.enable2FA ? "bg-[#2F80ED]" : "bg-[#F7F9FC]"
                    } w-[17px] h-[17px] rounded-[36px] transition-all duration-300 transform ${
                      formData.enable2FA ? "translate-x-5" : "translate-x-1"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
            <div className="w-full flex flex-col gap-[10px] p-[8px]">
              <h1 className="text-muted-foreground text-custom-lg">
                Financial settings
              </h1>
              <div className="flex flex-col w-full gap-[8px]">
                <div className="text-muted-foreground w-full text-custom-sm">
                  Linked bank accounts
                </div>
                <div className="flex gap-2 flex-wrap">
                  {formData.linkedBankAccounts.map((acc, id) => (
                    <div
                      key={id}
                      className="flex gap-[8px] items-center p-2 bg-background rounded-lg"
                    >
                      <p className="p-2 bg-button text-button text-custom-md font-bold rounded-full">
                        {shortenName(acc.name)}
                      </p>
                      <div className="flex flex-col">
                        <h1 className="text-custom-sm text-foreground font-semibold">
                          {acc.name}
                        </h1>
                        <p className="text-muted-foreground text-custom-xs">
                          {shortenAddress(acc.accNo, 2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddBankAccount}
                    className="bg-background border cursor-pointer border-border p-2 text-foreground rounded-[7px]"
                  >
                    <Plus />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex w-full flex-col lg:flex-row p-[24px] border-none">
            <div className="w-full flex flex-col gap-[10px] p-[8px]">
              <h1 className="text-muted-foreground text-custom-lg">
                Preferences
              </h1>
              <div className="flex justify-between items-center">
                <h1 className="text-muted-foreground text-custom-md">
                  Transaction Notifications
                </h1>
                <button
                  onClick={() =>
                    handleInputChange(
                      "transactionNotifications",
                      !formData.transactionNotifications
                    )
                  }
                  className={`cursor-pointer ${
                    formData.transactionNotifications
                      ? "bg-[#1A2B49] "
                      : "bg-[#C1C9D3] "
                  } h-[21px] rounded-[15px] transition-all duration-300 flex items-center w-[40px]`}
                >
                  <div
                    className={`${
                      formData.transactionNotifications
                        ? "bg-[#2F80ED]"
                        : "bg-[#F7F9FC]"
                    } w-[17px] h-[17px] rounded-[36px] transition-all duration-300 transform ${
                      formData.transactionNotifications
                        ? "translate-x-5 "
                        : "translate-x-1"
                    }`}
                  ></div>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-muted-foreground text-custom-md">
                  Dark mode
                </div>
                <button
                  onClick={() =>
                    handleInputChange("darkMode", !formData.darkMode)
                  }
                  className={`cursor-pointer ${
                    formData.darkMode ? "bg-[#1A2B49]" : "bg-[#C1C9D3] "
                  } h-[21px] rounded-[15px] transition-all duration-300 flex items-center w-[40px]`}
                >
                  <div
                    className={`${
                      formData.darkMode ? "bg-[#2F80ED]" : "bg-[#F7F9FC]"
                    } w-[17px] h-[17px] rounded-[36px] transition-all duration-300 transform ${
                      formData.darkMode ? "translate-x-5" : "translate-x-1"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </Card>

          <div className="w-full flex justify-between gap-4">
            <button
              onClick={handleSave}
              className="rounded-[7px] max-w-[200px] p-[16px_32px] bg-button hover:bg-hover text-button cursor-pointer w-full"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="w-full max-w-[200px] rounded-[12px] duration-200 transition-colors bg-white border border-[#2F80ED] text-[#2F80ED] hover:bg-hover hover:text-hover font-bold p-[16px_32px]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
