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
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useState } from "react";
import { useWalletData } from "../hooks/useWalletData";

interface WalletOverviewProps {
  handleViewBalance: () => void;
  hideBalalance: boolean;
}

export function WalletOverview({
  handleViewBalance,
  hideBalalance,
}: WalletOverviewProps) {
  const { addresses, breakdown } = useWalletData();
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const walletData = (() => {
    const normalize = (raw?: string | null) => {
      if (!raw) return "";
      const k = String(raw).toLowerCase().trim();
      if (k === "sol" || k === "solana" || k.startsWith("sol")) return "solana";
      if (k === "eth" || k === "ethereum") return "ethereum";
      if (k === "btc" || k === "bitcoin") return "bitcoin";
      if (k === "strk" || k === "starknet") return "starknet";
      if (k === "usdt" || k === "usdt_erc20" || k === "usdt-erc20") return "usdt_erc20";
      if (k === "usdt_trc20" || k === "usdt-trc20" || k === "usdttrc20") return "usdt_trc20";
      if (k === "dot" || k === "polkadot") return "polkadot";
      if (k === "xlm" || k === "stellar") return "stellar";
      return k;
    };

    const map: Record<string, any> = {};

    for (const addr of addresses || []) {
      const key = normalize(addr.chain);
      map[key] = map[key] || {};
      map[key].chain = key;
      map[key].address = addr.address;
      map[key].network = addr.network;
    }

    for (const b of breakdown || []) {
      const key = normalize(b.chain as string);
      map[key] = map[key] || {};
      map[key].chain = key;
      map[key].balance = b.balance || 0;
      map[key].ngnValue = b.ngnValue || 0;
      map[key].symbol = b.symbol || key.slice(0, 3).toUpperCase();
    }

    return Object.keys(map)
      .map((k) => ({
        chain: map[k].chain,
        address: map[k].address || "",
        network: map[k].network || "mainnet",
        balance: typeof map[k].balance === "number" ? map[k].balance : 0,
        ngnValue: typeof map[k].ngnValue === "number" ? map[k].ngnValue : 0,
        symbol: map[k].symbol || k.slice(0, 3).toUpperCase(),
      }))
      .sort((a, b) => a.chain.localeCompare(b.chain));
  })();

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
        setCopiedAddress(selectedAddress);
        setTimeout(() => setCopiedAddress(null), 2000);
      } catch (err) {
        console.error("Failed to copy address: ", err);
      }
    },
    []
  );

  return (
    <Card className="border-border/50 mb-8 bg-card/50 w-full max-h-132 overflow-y-scroll backdrop-blur-sm">
      {/* <CardHeader className="flex flex-row items-center justify-between pb-4">
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
      </CardHeader> */}

      <CardContent className="space-y-3 lg:space-y-4 grid grid-cols-2 md:grid-cols-4 gap-2 lg-gap-6 p-4">
        {walletData?.map((wallet, index) => (
          <div
            key={index}
            className="flex items-start gap-3 justify-between p-3 flex-col lg:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
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
                {/* <p className="font-medium text-xs lg:text-sm capitalize truncate">
                  {wallet.chain}
                </p>
                <p className="text-xs text-muted-foreground">
                  {shortenAddress(wallet.address as `0x${string}`, 6)}
                </p> */}
                {walletData.length === 0 ? (
                  <Skeleton className="h-4 w-20 mt-1 bg-gray-300" />
                ) : (
                  <p className="text-xs font-semibold text-green-600 mt-1">
                    {formatBalance(wallet.balance, wallet.symbol)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right flex-shrink-0 min-w-0">
              {walletData.length === 0 ? (
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

                </>
              )}
            </div>
          </div>
        ))}

       
      </CardContent>
    </Card>
  );
}