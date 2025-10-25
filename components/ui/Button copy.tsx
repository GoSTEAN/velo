import React from "react";
import Link from "next/link";

interface ButtonProps {
  type?:
    | "primary"
    | "secondary"
    | "blue"
    | "orange"
    | "purple"
    | "card"
    | undefined;
  width?: string;
  text?: string;
  children?: React.ReactNode;
  onclick?: React.MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
  disabled?: boolean;
  href?: string;
}

export default function Button({
  type,
  width = "w-full",
  text,
  onclick,
  children,
  loading,
  disabled = false,
  href,
}: ButtonProps): React.JSX.Element {
  const buttonClasses = `
    ${width} 
    ${type === "primary"
      ? "primary-purple-to-blue"
      : type === "secondary"
      ? "primary-orange-to-purple"
      : type === "blue"
      ? "bg-blue"
      : type === "orange"
      ? "bg-orange"
      : type === "purple"
      ? "bg-purple"
      : type === "card"
      ? "bg-card"
      : "bg-transparent"
    } 
    cursor-pointer
    py-3 
    rounded-3xl 
    text-white 
    font-bold 
    text-lg 
    relative 
    ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
  `.replace(/\s+/g, ' ').trim();

  const LoadingOverlay = () => (
    <span className="absolute top-0 w-full bg-black/50 rounded-3xl left-0 h-full flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </span>
  );

  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={`${buttonClasses} text-center`} >
        {text || children}
      </Link>
    );
  }

  return (
    <button
      onClick={onclick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {text || children}
      {(loading || disabled) && <LoadingOverlay />}
    </button>
  );
}