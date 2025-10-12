import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import { Check, ChevronRight, Copy, Eye, EyeClosed } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/buttons";
import { shortenAddress } from "../lib/utils";
import { useTotalBalance } from "../hooks/useTotalBalance";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useState } from "react";

interface WalletOverviewProps {
  addresses: any[];
  handleViewBalance: () => void;
  hideBalalance: boolean;
}

export function WalletOverview({
  addresses,
  handleViewBalance,
  hideBalalance,
}: WalletOverviewProps) {
  const { breakdown, loading } = useTotalBalance();
  const [copy, setCopied] = useState(false);

  console.log("breakdown", breakdown);
  // Merge addresses with their balances
  const walletData = addresses.map((address) => {
    const balanceInfo = breakdown.find((b) => b.chain === address.chain);
    return {
      ...address,
      balance: balanceInfo?.balance || 0,
      ngnValue: balanceInfo?.ngnValue || 0,
      symbol: balanceInfo?.symbol || address.chain.slice(0, 3).toUpperCase(),
    };
  });

  const formatBalance = (balance: number, symbol: string) => {
    if (balance === 0) return `0 ${symbol}`;
    if (balance < 0.001) return `<0.001 ${symbol}`;
    return `${balance.toFixed(4)} ${symbol}`;
  };

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleCopyAddress = useCallback(
    async (selectedAddress: `0x${string}`) => {
      if (!selectedAddress) return;

      try {
        await navigator.clipboard.writeText(selectedAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy address: ", err);
      }
    },
    []
  );

  return (
    <Card className="border-border/50 mb-8 bg-card/50 w-full max-h-132 overflow-y-scroll backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg lg:text-xl font-semibold">
          Wallet Overview
        </CardTitle>
        <Button
          variant="secondary"
          className="flex flex-none"
          onClick={() => (window.location.href = "#create-address")}
        >
          Manage
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 lg:space-y-4">
        {walletData?.slice(0, 6).map((wallet, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 lg:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center flex-shrink-0">
                <Image
                  src={`/${wallet.chain.toLowerCase()}.svg`}
                  alt={wallet.chain}
                  width={16}
                  height={16}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (
                      e.target as HTMLImageElement
                    ).nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <span className="text-xs font-bold hidden">
                  {wallet.chain.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs lg:text-sm capitalize truncate">
                  {wallet.chain}
                </p>
                <p className="text-xs text-muted-foreground">
                  {shortenAddress(wallet.address as `0x${string}`, 6)}
                </p>
                {loading ? (
                  <Skeleton className="h-4 w-20 mt-1 bg-gray-300" />
                ) : (
                  <p className="text-xs font-semibold text-green-600 mt-1">
                    {formatBalance(wallet.balance, wallet.symbol)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right flex-shrink-0 min-w-0">
              {loading ? (
                <Skeleton className="h-4 w-16 bg-gray-300" />
              ) : (
                <>
                  {hideBalalance ? (
                    <div className="text- font-black text-muted-foreground">
                      {" "}
                      ------
                    </div>
                  ) : (
                    <p className="text-sm font-semibold whitespace-nowrap">
                      {formatNGN(wallet.ngnValue)}
                    </p>
                  )}

                  <div className="flex items-center gap-2 ">
                    <Button
                      onClick={handleViewBalance}
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                    >
                      {hideBalalance ? (
                        <EyeClosed size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </Button>
                    <Button
                    onClick={ () => handleCopyAddress(wallet.address)}
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                  >
                    {copy ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Total Balance Summary */}
        {!loading && breakdown.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Value:</span>
              <span className="text-lg font-bold text-green-600">
                {formatNGN(
                  breakdown.reduce((sum, item) => sum + item.ngnValue, 0)
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
