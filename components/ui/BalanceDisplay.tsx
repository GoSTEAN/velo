"use client";

interface BalanceDisplayProps {
  balance: number;
  symbol: string;
  showNGN?: boolean;
  ngnValue?: number;
  hideBalance?: boolean;
  className?: string;
}

export function BalanceDisplay({ 
  balance, 
  symbol, 
  showNGN = false, 
  ngnValue = 0, 
  hideBalance = false,
  className = ""
}: BalanceDisplayProps) {
  
  const formatBalance = (bal: number, sym: string): string => {
    if (bal === 0) return `0 ${sym}`;
    if (bal < 0.001) return `<0.001 ${sym}`;
    return `${bal.toFixed(4)} ${sym}`;
  };

  const formatNGN = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (hideBalance) {
    return <span className={`text-muted-foreground ${className}`}>------</span>;
  }

  return (
    <div className={className}>
      <div className="font-medium">{formatBalance(balance, symbol)}</div>
      {showNGN && ngnValue > 0 && (
        <div className="text-sm text-muted-foreground">
          ≈ {formatNGN(ngnValue)}
        </div>
      )}
    </div>
  );
}