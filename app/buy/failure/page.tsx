import Footer from '@/components/landingpage/landing/Footer';
import { Navigation } from '@/components/landingpage/landing/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

type Props = {
  searchParams?: {
    txId?: string;
    reason?: string;
    amount?: string;
    asset?: string;
  };
};

export default function BuyFailure({ searchParams }: Props) {
  const txId = searchParams?.txId;
  const reason = searchParams?.reason;
  const amount = searchParams?.amount;
  const asset = searchParams?.asset;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="mx-auto inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive text-white mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Purchase Failed</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Unfortunately your purchase could not be completed. You can try again or contact support if the problem persists.
            </p>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-medium">{amount ?? '—'} {asset ?? ''}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium text-destructive">Failed</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Reference</dt>
                <dd className="font-mono text-xs break-all">{txId ?? reason ?? '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="flex gap-4">
            <Link href="/buy" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 shadow">
              Try Again
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2">
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
