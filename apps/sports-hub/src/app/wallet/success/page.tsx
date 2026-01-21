'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WalletSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/wallet');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your wallet top-up is being processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              ✅ Your payment has been received and is being processed by PayFast.
              Your wallet will be updated shortly.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              You will receive a confirmation email once the payment is confirmed.
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Redirecting to wallet in <span className="font-bold text-purple-600">{countdown}</span> seconds...
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/wallet">
              <Button className="w-full" variant="default">
                View Wallet
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="w-full" variant="outline">
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Payment ID: {searchParams.get('payment_id') || 'Processing...'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
