import Footer from '@/components/landingpage/landing/Footer';
import { Navigation } from '@/components/landingpage/landing/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function BuySuccess({ searchParams }: any) {
  const resolve = (val: any) => (Array.isArray(val) ? val[0] : val);

  const txId = resolve(searchParams?.txId);
  const amount = resolve(searchParams?.amount);
  const asset = resolve(searchParams?.asset);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="mx-auto inline-flex items-center justify-center w-24 h-24 rounded-full bg-velo-gradient text-white mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Purchase Successful</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your purchase completed successfully. You can view the transaction details below.
            </p>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-medium">{amount ?? '—' } {asset ?? ''}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium text-success">Completed</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Transaction ID</dt>
                <dd className="font-mono text-xs break-all">{txId ?? '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="flex gap-4">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 shadow">
              View Dashboard
            </Link>
            <Link href="/buy" className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2">
              Buy More
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
