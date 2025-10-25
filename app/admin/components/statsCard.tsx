// components/stats-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards';
import { StatsData } from '@/types/admin';

interface StatsCardsProps {
  data: StatsData;
}

export function StatsCards({ data }: StatsCardsProps) {
    const usdtTotal = data.holdings.map(data => data.usd)
       const calculatedUsdtBal = () => {
        let bal = 0;
        for(let i = 0; i < usdtTotal.length; i++){
            bal = bal + usdtTotal[i]; 
        }
        return bal; 
    }



  const cards = [
    {
      title: 'Total Users',
      value: data.totalUsers,
      description: 'Registered users',
    },
    {
      title: 'Total Confirmed Amount',
      value: data.totalConfirmedAmount,
      description: 'Across all transactions',
    },
    {
      title: 'Most Used Chain',
      value: data.mostUsedChain,
      description: 'Popular blockchain network on VELO',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}