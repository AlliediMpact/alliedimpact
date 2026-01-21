'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle } from 'lucide-react';

interface MFAVerificationModalProps {
  isOpen: boolean;
  onVerify: (token: string, isBackupCode: boolean) => Promise<boolean>;
  onClose: () => void;
  allowBackupCodes?: boolean;
}

/**
 * MFA Verification Modal
 * 
 * Prompts users to enter their MFA code during login.
 * Supports both authenticator app codes and backup codes.
 */
export default function MFAVerificationModal({
  isOpen,
  onVerify,
  onClose,
  allowBackupCodes = true,
}: MFAVerificationModalProps) {
  const [activeTab, setActiveTab] = useState<'app' | 'backup'>('app');
  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    const codeToVerify = activeTab === 'app' ? token : backupCode;
    
    if (!codeToVerify) {
      setError('Please enter a code');
      return;
    }

    if (activeTab === 'app' && codeToVerify.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const valid = await onVerify(codeToVerify, activeTab === 'backup');
      
      if (valid) {
        // Reset form
        setToken('');
        setBackupCode('');
        setActiveTab('app');
      } else {
        setError(
          activeTab === 'app'
            ? 'Invalid code. Please try again.'
            : 'Invalid or used backup code.'
        );
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleVerify();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
          </div>
          <DialogDescription>
            Enter your authentication code to continue
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'app' | 'backup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="app">Authenticator App</TabsTrigger>
            {allowBackupCodes && (
              <TabsTrigger value="backup">Backup Code</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="app" className="space-y-4">
            <div>
              <Label htmlFor="token">6-Digit Code</Label>
              <Input
                id="token"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Open your authenticator app to get your code
              </p>
            </div>
          </TabsContent>

          {allowBackupCodes && (
            <TabsContent value="backup" className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  Backup codes can only be used once. After using a code, it will no longer be valid.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="backupCode">Backup Code</Label>
                <Input
                  id="backupCode"
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="XXXXXXXX"
                  className="text-center text-xl tracking-wider font-mono"
                  maxLength={8}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter one of your saved backup codes
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={
              loading ||
              (activeTab === 'app' ? token.length !== 6 : !backupCode)
            }
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
