'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Shield, Loader2 } from 'lucide-react';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import MFASettings from '@/components/MFASettings';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      // Fetch user data from Firestore
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setMfaEnabled(data.mfaEnabled || false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account information and security settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your basic account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <Label className="text-sm text-gray-500">Display Name</Label>
                  <p className="font-medium">{user.displayName || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p className="font-medium">{user.email}</p>
                  {user.emailVerified && (
                    <span className="text-xs text-green-600">✓ Verified</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <Label className="text-sm text-gray-500">Member Since</Label>
                  <p className="font-medium">
                    {user.metadata.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* MFA Settings */}
        <MFASettings
          userId={user.uid}
          mfaEnabled={mfaEnabled}
          onStatusChange={(enabled) => setMfaEnabled(enabled)}
        />

        <Separator />

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/wallet')}
              className="w-full sm:w-auto"
            >
              View Wallet
            </Button>
            <Button
              variant="outline"
              onClick={() => auth.signOut().then(() => router.push('/'))}
              className="w-full sm:w-auto ml-0 sm:ml-2"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
