type AmountInputProps = {
  value: string;
  onChange: (value: string) => void;
  currency: string;
  disabled?: boolean;
  placeholder?: string;
};

export const AmountInput = ({ 
  value, 
  onChange, 
  currency, 
  disabled, 
  placeholder = "0.00" 
}: AmountInputProps) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d*\.?\d*$/.test(value)) {
            onChange(value);
          }
        }}
        placeholder={placeholder}
        className="w-full p-3 rounded-lg  border-border bg-muted placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors pr-20 disabled:opacity-50"
        disabled={disabled}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
        {currency}
      </div>
    </div>
  );
};