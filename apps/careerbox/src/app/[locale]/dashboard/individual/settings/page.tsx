'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Settings,
  User,
  Bell,
  Lock,
  CreditCard,
  Eye,
  EyeOff,
  Check,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';

  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy' | 'subscription'>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Account settings
  const [accountData, setAccountData] = useState({
    displayName: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+27 82 345 6789',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailMatches: true,
    emailMessages: true,
    emailUpdates: false,
    pushMatches: true,
    pushMessages: true,
    pushUpdates: false,
    weeklyDigest: true,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public' as 'public' | 'matches-only' | 'private',
    showEmail: false,
    showPhone: false,
    searchable: true,
  });

  // Subscription data
  const [subscription] = useState({
    tier: 'free' as 'free' | 'entry' | 'classic',
    status: 'active',
    renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  });

  const handleSaveAccount = async () => {
    setIsSaving(true);
    setSuccessMessage('');

    try {
      // TODO: Call API to update account settings
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Account settings saved successfully!');
      setAccountData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving account settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setSuccessMessage('');

    try {
      // TODO: Call API to update notification settings
      await new Promise(resolve => setTimeout(resolve, 800));

      setSuccessMessage('Notification preferences saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    setSuccessMessage('');

    try {
      // TODO: Call API to update privacy settings
      await new Promise(resolve => setTimeout(resolve, 800));

      setSuccessMessage('Privacy settings saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <Check className="h-5 w-5" />
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-2 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Update your personal information and password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={accountData.displayName}
                      onChange={(e) => setAccountData(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={accountData.email}
                      onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={accountData.phone}
                      onChange={(e) => setAccountData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={accountData.currentPassword}
                            onChange={(e) => setAccountData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={accountData.newPassword}
                          onChange={(e) => setAccountData(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={accountData.confirmPassword}
                          onChange={(e) => setAccountData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveAccount} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900">New Matches</p>
                          <p className="text-sm text-gray-600">Get notified when you have new job matches</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailMatches}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailMatches: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900">New Messages</p>
                          <p className="text-sm text-gray-600">Get notified when you receive messages</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailMessages}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailMessages: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900">Platform Updates</p>
                          <p className="text-sm text-gray-600">Get updates about new features and improvements</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailUpdates}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailUpdates: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900">Weekly Digest</p>
                          <p className="text-sm text-gray-600">Receive a weekly summary of your activity</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.weeklyDigest}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Push Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900">New Matches</p>
                          <p className="text-sm text-gray-600">Browser notifications for new matches</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushMatches}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushMatches: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900">New Messages</p>
                          <p className="text-sm text-gray-600">Browser notifications for new messages</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushMessages}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushMessages: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveNotifications} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control who can see your information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <select
                      id="profileVisibility"
                      value={privacySettings.profileVisibility}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as typeof prev.profileVisibility }))}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <option value="public">Public - Anyone can see your profile</option>
                      <option value="matches-only">Matches Only - Only companies you match with</option>
                      <option value="private">Private - Hidden from search</option>
                    </select>
                    <p className="text-sm text-gray-600">
                      {privacySettings.profileVisibility === 'public' && 'Your profile is visible to all companies on the platform'}
                      {privacySettings.profileVisibility === 'matches-only' && 'Only companies with active matches can view your full profile'}
                      {privacySettings.profileVisibility === 'private' && 'Your profile is hidden from company searches'}
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900">Show Email Address</p>
                          <p className="text-sm text-gray-600">Allow matches to see your email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings.showEmail}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, showEmail: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900">Show Phone Number</p>
                          <p className="text-sm text-gray-600">Allow matches to see your phone</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings.showPhone}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, showPhone: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">Searchable Profile</p>
                        <p className="text-sm text-gray-600">Allow companies to find you in search results</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacySettings.searchable}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, searchable: e.target.checked }))}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSavePrivacy} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Settings */}
            {activeTab === 'subscription' && (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription & Billing</CardTitle>
                  <CardDescription>Manage your subscription plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 capitalize mb-1">
                          {subscription.tier} Tier
                        </h3>
                        <p className="text-sm text-gray-600">
                          Status: <span className="font-semibold capitalize">{subscription.status}</span>
                        </p>
                      </div>
                      <Badge
                        variant={subscription.tier === 'free' ? 'tier.free' : subscription.tier === 'entry' ? 'tier.entry' : 'tier.classic'}
                        className="text-base px-3 py-1"
                      >
                        {subscription.tier === 'free' && 'Free'}
                        {subscription.tier === 'entry' && 'Entry'}
                        {subscription.tier === 'classic' && <><Crown className="h-3 w-3 mr-1 inline" />Classic</>}
                      </Badge>
                    </div>

                    {subscription.tier !== 'free' && (
                      <p className="text-sm text-gray-700 mb-4">
                        Next renewal: {subscription.renewalDate.toLocaleDateString()}
                      </p>
                    )}

                    <Button onClick={() => router.push(`/${locale}/pricing`)}>
                      {subscription.tier === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                    </Button>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Current Plan Features</h3>
                    {subscription.tier === 'free' && (
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Create your profile
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          View job matches
                        </li>
                        <li className="flex items-center gap-2 opacity-50">
                          <X className="h-4 w-4" />
                          Upload resume and documents
                        </li>
                        <li className="flex items-center gap-2 opacity-50">
                          <X className="h-4 w-4" />
                          Unlimited messaging
                        </li>
                      </ul>
                    )}
                    {subscription.tier === 'entry' && (
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          All Free features
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Upload resume and documents
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Unlimited messaging
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Priority matching
                        </li>
                      </ul>
                    )}
                    {subscription.tier === 'classic' && (
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          All Entry features
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Profile verification badge
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Featured in search results
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Priority support
                        </li>
                      </ul>
                    )}
                  </div>

                  {subscription.tier !== 'free' && (
                    <div className="border-t pt-6">
                      <Button variant="destructive" onClick={() => alert('Cancel subscription feature coming soon')}>
                        Cancel Subscription
                      </Button>
                      <p className="text-sm text-gray-600 mt-2">
                        You'll continue to have access until {subscription.renewalDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
