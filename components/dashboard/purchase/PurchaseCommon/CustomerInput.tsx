import React from "react";

interface CustomerInputProps {
  type: "airtime" | "data" | "electricity";
  value: string;
  onChange: (value: string) => void;
  config: {
    customerLabel: string;
    placeholder: string;
  };
  className?: string;
}

export function CustomerInput({
  type,
  value,
  onChange,
  config,
  className = "",
}: CustomerInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Phone number validation (numbers only)
    if (type !== "electricity") {
      inputValue = inputValue.replace(/[^\d]/g, '');
      // Limit to 10 digits for Nigerian phone numbers
      if (inputValue.length > 10) {
        inputValue = inputValue.substring(0, 10);
      }
    }
    
    onChange(inputValue);
  };

  const getInputType = () => {
    if (type === "electricity") return "text";
    return "tel";
  };

  return (
    <div className={`space-y-3 w-full ${className}`}>
      <label className="block text-sm font-medium">
        {config.customerLabel}
      </label>
      
      <div className="flex flex-1 w-full gap-2">
        {type !== "electricity" && (
          <div className="sm:px-4 sm:py-3 text-sm sm:textn-md px-2 rounded-lg bg-muted text-foreground font-medium flex items-center justify-center">
            +234
          </div>
        )}
        
        <input
          type={getInputType()}
          value={value}
          onChange={handleChange}
          placeholder={config.placeholder}
          className={` sm:p-4 p-2 rounded-lg border  bg-muted w-full placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors ${
            type === "electricity" ? "" : ""
          }`}
          maxLength={type === "electricity" ? undefined : 10}
        />
      </div>
      
      {type !== "electricity" && value && value.length < 10 && (
        <p className="text-sm text-red-300">
          Enter a 10-digit Nigerian phone number
        </p>
      )}
    </div>
  );
}