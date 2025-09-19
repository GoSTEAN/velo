import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "xs" | "sm" | "md" | "lg";
  onclick?: () => {};
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "sm",
  className = "",
  onclick,
  ...props
}) => {
  const baseClasses =
    " transition-colors duration-200 border border-border font-medium ";

  const variantClasses = {
    primary: "bg-button rounded-md text-button hover:bg-hover  hover:text-hover cursor-pointer",
    secondary: "bg-white  rounded-md text-head border hover:bg-hover  hover:text-hover  cursor-pointer ",
    tertiary: "bg-transparent rounded-md text-button hover:bg-hover  hover:text-hover  border cursor-pointer ",
  };

  const sizeClasses = {

    xs: " px-1 py-1 sm:px-3 sm:py-3 sm:text-sm text-xs",
    sm: " px-2 py-1.5 sm:px-6 sm:py-3 sm:text-sm text-xs",
    md: "px-4 py-1.5 sm:px-12 sm:py-3 text-xs",
    lg: "sm:px-24 sm:py-3 sm:text-lg text-xs",
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button onClick={onclick} className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
