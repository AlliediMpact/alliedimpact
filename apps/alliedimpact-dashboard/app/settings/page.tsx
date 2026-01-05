'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '../lib/dashboard-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { 
  User, 
  Bell, 
  Lock, 
  CreditCard, 
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Camera
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { platformUser, user } = useDashboard();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'billing'>('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,
    courseUpdates: true,
    projectUpdates: true,
    paymentAlerts: true,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public' as 'public' | 'private' | 'connections',
    showEmail: false,
    showPhone: false,
    dataSharing: false,
    analyticsOptOut: false,
  });

  useEffect(() => {
    if (platformUser) {
      setProfileData({
        displayName: platformUser.displayName || '',
        email: platformUser.email || '',
        phone: platformUser.phoneNumber || '',
        location: '',
        bio: '',
      });
    }
  }, [platformUser]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // TODO: Implement profile update endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Implement notification preferences endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setLoading(true);
    try {
      // TODO: Implement privacy settings endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <Button variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="+27 XX XXX XXXX"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3">
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  {saved && (
                    <span className="text-sm text-green-600">✓ Changes saved successfully</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>

                <hr />

                {/* Specific Notifications */}
                <div className="space-y-4">
                  <h3 className="font-medium">Notification Types</h3>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Course updates and new lessons</p>
                    <input
                      type="checkbox"
                      checked={notificationSettings.courseUpdates}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, courseUpdates: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm">Project milestones and updates</p>
                    <input
                      type="checkbox"
                      checked={notificationSettings.projectUpdates}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, projectUpdates: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm">Payment and billing alerts</p>
                    <input
                      type="checkbox"
                      checked={notificationSettings.paymentAlerts}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, paymentAlerts: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm">Weekly activity digest</p>
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyDigest}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyDigest: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm">Marketing emails and promotions</p>
                    <input
                      type="checkbox"
                      checked={notificationSettings.marketingEmails}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, marketingEmails: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3">
                  <Button onClick={handleSaveNotifications} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                  {saved && (
                    <span className="text-sm text-green-600">✓ Preferences saved successfully</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Control your privacy and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Visibility */}
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="public">Public - Anyone can see your profile</option>
                    <option value="connections">Connections Only - Only people you're connected with</option>
                    <option value="private">Private - Only you can see your profile</option>
                  </select>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="font-medium">Contact Information Visibility</h3>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Show email address on profile</p>
                    <input
                      type="checkbox"
                      checked={privacySettings.showEmail}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm">Show phone number on profile</p>
                    <input
                      type="checkbox"
                      checked={privacySettings.showPhone}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, showPhone: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>
                </div>

                <hr />

                {/* Data & Analytics */}
                <div className="space-y-3">
                  <h3 className="font-medium">Data & Analytics</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Share usage data</p>
                      <p className="text-xs text-muted-foreground">Help us improve by sharing anonymous usage data</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.dataSharing}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, dataSharing: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Opt out of analytics</p>
                      <p className="text-xs text-muted-foreground">Disable all analytics tracking</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.analyticsOptOut}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, analyticsOptOut: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>
                </div>

                <hr />

                {/* Account Actions */}
                <div className="space-y-3">
                  <h3 className="font-medium text-red-600">Danger Zone</h3>
                  
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>

                  <Button variant="outline" className="w-full">
                    Download My Data
                  </Button>

                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3">
                  <Button onClick={handleSavePrivacy} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Settings'}
                  </Button>
                  {saved && (
                    <span className="text-sm text-green-600">✓ Settings saved successfully</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscriptions</CardTitle>
                <CardDescription>Manage your subscriptions and payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Active Subscriptions */}
                <div>
                  <h3 className="font-medium mb-3">Active Subscriptions</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Coin Box - Professional</h4>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Next billing date: February 5, 2026
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Manage Subscription</Button>
                      <Button variant="ghost" size="sm" className="text-red-600">Cancel</Button>
                    </div>
                  </div>
                </div>

                <hr />

                {/* Payment Methods */}
                <div>
                  <h3 className="font-medium mb-3">Payment Methods</h3>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                </div>

                <hr />

                {/* Billing History */}
                <div>
                  <h3 className="font-medium mb-3">Billing History</h3>
                  <div className="space-y-2">
                    {[
                      { date: 'January 5, 2026', description: 'Coin Box - Professional', amount: 'R 1,100.00' },
                      { date: 'December 5, 2025', description: 'Coin Box - Professional', amount: 'R 1,100.00' },
                      { date: 'November 5, 2025', description: 'Coin Box - Standard', amount: 'R 550.00' },
                    ].map((invoice, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{invoice.description}</p>
                          <p className="text-xs text-muted-foreground">{invoice.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{invoice.amount}</p>
                          <Button variant="ghost" size="sm">Download</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
