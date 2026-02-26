'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Copy, Check, Download, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface MFAEnrollmentProps {
  qrCode: string;
  secret: string;
  backupCodes: string[];
  onVerify: (token: string) => Promise<boolean>;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * MFA Enrollment Component
 * 
 * Guides users through MFA setup process:
 * 1. Scan QR code with authenticator app
 * 2. Enter verification code
 * 3. Save backup codes
 */
export default function MFAEnrollment({
  qrCode,
  secret,
  backupCodes,
  onVerify,
  onComplete,
  onCancel,
}: MFAEnrollmentProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  const handleCopySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackupCodes(true);
    setTimeout(() => setCopiedBackupCodes(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const content = `SportsHub MFA Backup Codes
Generated: ${new Date().toLocaleDateString()}

Keep these codes in a safe place. Each code can only be used once.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

If you lose access to your authenticator app, you can use these codes to sign in.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sportshub-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleVerify = async () => {
    if (token.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const valid = await onVerify(token);
      
      if (valid) {
        setStep('backup');
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Setup
  if (step === 'setup') {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Enable Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Step 1: Scan QR Code</h3>
            <p className="text-sm text-gray-600 mb-4">
              Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code.
            </p>
            
            <div className="flex justify-center p-4 bg-white border rounded-lg">
              <Image
                src={qrCode}
                alt="MFA QR Code"
                width={200}
                height={200}
                className="rounded"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Can't scan the code?</h3>
            <p className="text-sm text-gray-600 mb-2">
              Enter this code manually in your authenticator app:
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={secret}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySecret}
              >
                {copiedSecret ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => setStep('verify')} className="flex-1">
            Continue
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Step 2: Verify
  if (step === 'verify') {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Verify Your Setup</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="token">Authentication Code</Label>
            <Input
              id="token"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              The code changes every 30 seconds
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep('setup')}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleVerify}
            disabled={loading || token.length !== 6}
            className="flex-1"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Step 3: Backup Codes
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Save Your Backup Codes</CardTitle>
        <CardDescription>
          Store these codes in a safe place. You can use them to access your account if you lose your phone.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            Each backup code can only be used once. After using a code, it will no longer be valid.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg border">
          {backupCodes.map((code, index) => (
            <div
              key={index}
              className="font-mono text-sm text-center p-2 bg-white rounded border"
            >
              {code}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopyBackupCodes}
            className="flex-1"
          >
            {copiedBackupCodes ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Codes
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadBackupCodes}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onComplete} className="w-full">
          I've Saved My Backup Codes
        </Button>
      </CardFooter>
    </Card>
  );
}
