import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards';
import { StatsData } from '@/types/admin';

interface UsageStatsProps {
  data: StatsData;
}

export function UsageStats({ data }: UsageStatsProps) {
  const usageItems = [
    { label: 'Send', value: data.usage.send },
    { label: 'Receive', value: data.usage.receive },
    { label: 'QR Payment', value: data.usage.qrPayment },
    { label: 'Splitting', value: data.usage.splitting },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {usageItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center justify-center rounded-lg border p-4 text-center">
              <span className="text-2xl font-bold">{item.value}</span>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}