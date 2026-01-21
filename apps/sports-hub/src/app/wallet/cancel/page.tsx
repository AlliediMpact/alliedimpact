'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WalletCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>
            Your wallet top-up was not completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 text-center">
              ⚠️ Your payment was cancelled. No charges were made to your account.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              You can try again anytime. If you experienced an issue during payment,
              please contact our support team.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/wallet">
              <Button className="w-full" variant="default">
                Try Again
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
              Need help? <Link href="/contact" className="text-purple-600 hover:underline">Contact Support</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
