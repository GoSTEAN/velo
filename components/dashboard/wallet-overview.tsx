import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cards"

import { ChevronRight, Eye } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/buttons";
import { shortenAddress } from "../lib/utils";

export function WalletOverview({ addresses }: { addresses: any[] }) {
  return (
    <Card className="border-0  shadow-lg">
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
        {addresses?.slice(0, 4).map((wallet, index) => (
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
                    (e.target as HTMLImageElement).style.display = "none"
                    ;(e.target as HTMLImageElement)
                      .nextElementSibling?.classList.remove("hidden")
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
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <Button variant="secondary">
                <Eye size={14} />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
