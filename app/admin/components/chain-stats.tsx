import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import { StatsData } from "@/types/admin";

interface ChainStatsProps {
  data: StatsData;
}

export function ChainStats({ data }: ChainStatsProps) {
  const chainStats = data.holdings.map((data) => data);
  console.log("chain stats", chainStats);

  return (
    <Card className="max-h-100 overflow-y-scroll">
      <CardHeader>
        <CardTitle>Chain Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 ">
          {chainStats.map((chain, index) => {
            return (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium capitalize">
                    {chain.chain}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Total Balance</p>
                  <p className="text-sm text-muted-foreground">
                    {chain.balance}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
