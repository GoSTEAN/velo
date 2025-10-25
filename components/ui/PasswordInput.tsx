"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    onChange,
    placeholder = "Password",
    className = "",
}) => {
    const [show, setShow] = useState(false);

    return (
        <div
            className={`w-full flex items-center justify-between bg-card rounded-3xl p-4`}
        >
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`placeholder:placeholder-text bg-card rounded-3xl text-md font-medium px-2 select-none appearance-none outline-none border-none w-full ${className}`}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="placeholder-text focus:outline-none"
            >
                {show ? <EyeOff /> : <Eye />}
            </button>
        </div>
    );
};

export default PasswordInput;
