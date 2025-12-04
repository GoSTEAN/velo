import React from 'react';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  chain?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  chain = '',
  placeholder = 'Enter wallet address',
  disabled = false,
  className = '',
}) => {
  const getChainLabel = () => {
    if (!chain) return '';
    return chain.charAt(0).toUpperCase() + chain.slice(1);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-3 rounded-lg bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono text-sm disabled:opacity-50"
      />
      {chain && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-accent/20 px-2 py-1 rounded">
          {getChainLabel()}
        </div>
      )}
    </div>
  );
};