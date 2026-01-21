'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MFAEnrollment from './MFAEnrollment';

interface MFASettingsProps {
  userId: string;
  mfaEnabled: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

/**
 * MFA Settings Component
 * 
 * Allows users to:
 * - Enable MFA
 * - Disable MFA
 * - View MFA status
 * - Regenerate backup codes
 */
export default function MFASettings({
  userId,
  mfaEnabled: initialMfaEnabled,
  onStatusChange,
}: MFASettingsProps) {
  const [mfaEnabled, setMfaEnabled] = useState(initialMfaEnabled);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // MFA enrollment data
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleEnableMFA = async () => {
    setLoading(true);
    setError('');

    try {
      // Call Cloud Function to generate MFA secret
      const response = await fetch('/api/mfa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to enable MFA');
      }

      const data = await response.json();
      
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setEnrolling(true);
    } catch (err) {
      setError('Failed to enable MFA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      });

      return response.ok;
    } catch (err) {
      return false;
    }
  };

  const handleCompleteMFA = () => {
    setMfaEnabled(true);
    setEnrolling(false);
    setSuccess('Two-factor authentication enabled successfully!');
    onStatusChange?.(true);
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleDisableMFA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to disable MFA');
      }

      setMfaEnabled(false);
      setSuccess('Two-factor authentication disabled.');
      onStatusChange?.(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to disable MFA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!confirm('This will invalidate your existing backup codes. Are you sure?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mfa/regenerate-backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate backup codes');
      }

      const data = await response.json();
      setBackupCodes(data.backupCodes);
      setSuccess('New backup codes generated. Please save them securely.');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to regenerate backup codes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show enrollment flow
  if (enrolling) {
    return (
      <MFAEnrollment
        qrCode={qrCode}
        secret={secret}
        backupCodes={backupCodes}
        onVerify={handleVerifyMFA}
        onComplete={handleCompleteMFA}
        onCancel={() => setEnrolling(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${mfaEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              {mfaEnabled ? (
                <ShieldCheck className="w-6 h-6 text-green-600" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                {mfaEnabled
                  ? 'Your account is protected with 2FA'
                  : 'Add an extra layer of security to your account'}
              </CardDescription>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            mfaEnabled
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {mfaEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {!mfaEnabled ? (
            <>
              <p className="text-sm text-gray-600">
                Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
              </p>
              <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
                <li>Protects against password theft</li>
                <li>Prevents unauthorized access</li>
                <li>Required for admin accounts</li>
                <li>Works with Google Authenticator, Authy, and more</li>
              </ul>
              <Button
                onClick={handleEnableMFA}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Enable Two-Factor Authentication
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Your account is secured with two-factor authentication. You'll need to enter a code from your authenticator app when signing in.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleRegenerateBackupCodes}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Regenerate Backup Codes'
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisableMFA}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    'Disable 2FA'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
