'use client';

import { useDashboard } from '../lib/dashboard-context';
import { analytics, AnalyticsEvents } from '../lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { Input } from '@allied-impact/ui';
import { Label } from '@allied-impact/ui';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import { updatePassword, sendPasswordResetEmail } from 'firebase/auth';

export default function ProfilePage() {
  const { user, platformUser } = useDashboard();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    displayName: platformUser?.displayName || '',
    email: user?.email || '',
    phone: platformUser?.phoneNumber || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // TODO: Implement profile update with platform service
      // await updatePlatformUser(user.uid, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setSaving(true);

    try {
      if (user) {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const { updatePassword: fbUpdatePassword } = await import('firebase/auth');
        await fbUpdatePassword(user, passwordData.newPassword);
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ 
          type: 'error', 
          text: 'Please sign in again before changing your password' 
        });
      } else {
        setMessage({ type: 'error', text: error.message || 'Failed to change password' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;

    setSaving(true);
    setMessage(null);

    try {
      const auth = user.auth;
      await sendPasswordResetEmail(auth, user.email);
      setMessage({ 
        type: 'success', 
        text: 'Password reset email sent! Check your inbox.' 
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send reset email' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground text-lg">
          Manage your account information and preferences
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile details and contact information
              </CardDescription>
            </div>
            {!editing && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  disabled={!editing}
                  placeholder="Your name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  placeholder="+27 XX XXX XXXX"
                />
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    displayName: platformUser?.displayName || '',
                    email: user?.email || '',
                    phone: platformUser?.phoneNumber || '',
                  });
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your password and account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleChangePassword} disabled={saving}>
              Change Password
            </Button>
            <Button variant="outline" onClick={handleSendPasswordReset} disabled={saving}>
              Send Reset Email
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Password requirements:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Include at least one special character</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View your account details and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-sm">{user?.uid}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email Verified</p>
              <p className="font-medium">{user?.emailVerified ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {user?.metadata.creationTime ? 
                  new Date(user.metadata.creationTime).toLocaleDateString() : 
                  'N/A'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled>
            Delete Account
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Account deletion is currently disabled. Contact support for assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
