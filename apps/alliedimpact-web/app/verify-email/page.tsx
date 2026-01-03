'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@allied-impact/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Allied iMpact</h1>
        </div>

        <Card className="shadow-lg text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent a verification email to<br />
              <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-start gap-3 text-sm text-left">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p>Click the verification link in the email to activate your account</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-left">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p>Once verified, you can sign in and access all Allied iMpact products</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{' '}
              <button className="text-primary hover:underline font-medium">
                resend verification email
              </button>
            </p>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Go to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
