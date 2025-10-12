"use client";

import { Card } from "@/components/ui/Card";
import Image from "next/image";

interface TokenSelectionProps {
  onTokenSelect: (token: string) => void;
}

const tokens = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "/bitcoin.svg",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "/ethereum.svg",
  },
  {
    symbol: "STRK",
    name: "Starknet",
    icon: "/starknet.svg",
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "/solana.svg",
  },
  {
    symbol: "USDT TRC_20",
    name: "Tether",
    icon: "/usdt_trc20.svg",
  },
  {
    symbol: "USDT ERC_20",
    name: "USD Coin",
    icon: "/usdt_erc20.svg",
  }
];

export default function TokenSelection({ onTokenSelect }: TokenSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Select Cryptocurrency
        </h2>
        <p className="text-muted-foreground text-sm">
          Choose which cryptocurrency you want to buy
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tokens.map((token) => (
          <Card
            key={token.symbol}
            className="p-4 bg-background border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => onTokenSelect(token.symbol)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
                <Image
                  src={token.icon}
                  alt={token.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">
                  {token.symbol}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {token.name}
                </p>
              </div>
            </div>
           
          </Card>
        ))}
      </div>

      <div className="bg-accent/30 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-medium text-foreground mb-2">
           Buying Tips
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Prices update in real-time</li>
          <li>• No hidden fees</li>
          <li>• Instant delivery to your wallet</li>
        </ul>
      </div>
    </div>
  );
}