'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@allied-impact/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getAuthInstance } from '@/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastResendTime, setLastResendTime] = useState(0);

  const handleResendEmail = async () => {
    // Rate limiting: 60 seconds between resends
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const cooldownPeriod = 60000; // 60 seconds

    if (timeSinceLastResend < cooldownPeriod) {
      const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastResend) / 1000);
      setMessage({
        type: 'error',
        text: `Please wait ${remainingSeconds} seconds before requesting another email.`
      });
      return;
    }

    setResending(true);
    setMessage(null);

    try {
      const auth = getAuthInstance();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setMessage({
          type: 'error',
          text: 'No user found. Please sign up again.'
        });
        return;
      }

      if (currentUser.emailVerified) {
        setMessage({
          type: 'success',
          text: 'Your email is already verified! You can sign in now.'
        });
        return;
      }

      await sendEmailVerification(currentUser);
      setLastResendTime(now);
      setMessage({
        type: 'success',
        text: 'Verification email sent! Please check your inbox.'
      });
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      const errorMessage = error.code === 'auth/too-many-requests'
        ? 'Too many requests. Please try again later.'
        : 'Failed to send verification email. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setResending(false);
    }
  };

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

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                {resending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'resend verification email'
                )}
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
