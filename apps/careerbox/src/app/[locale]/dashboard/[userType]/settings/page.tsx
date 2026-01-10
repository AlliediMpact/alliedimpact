'use client';

import { useState } from 'react';
import { Settings, Mail, Lock, Bell, Eye, EyeOff, Download, Trash2, Shield, Check, AlertTriangle, Key, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EmailPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'privacy' | 'security' | 'data'>('email');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  // Email Preferences
  const [emailPreferences, setEmailPreferences] = useState<EmailPreference[]>([
    {
      id: 'job-alerts',
      title: 'Job Alerts',
      description: 'Receive notifications when new jobs matching your criteria are posted',
      enabled: true
    },
    {
      id: 'application-updates',
      title: 'Application Updates',
      description: 'Get notified about status changes on your applications',
      enabled: true
    },
    {
      id: 'messages',
      title: 'Message Notifications',
      description: 'Email notifications when you receive new messages',
      enabled: true
    },
    {
      id: 'profile-views',
      title: 'Profile View Alerts',
      description: 'Weekly summary of who viewed your profile',
      enabled: false
    },
    {
      id: 'marketing',
      title: 'Marketing & Tips',
      description: 'Career advice, job search tips, and CareerBox updates',
      enabled: true
    },
    {
      id: 'weekly-digest',
      title: 'Weekly Digest',
      description: 'Summary of your activity and new opportunities',
      enabled: false
    }
  ]);

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([
    {
      id: 'hide-profile',
      title: 'Hide Profile from Search',
      description: 'Make your profile invisible in company searches',
      enabled: false
    },
    {
      id: 'anonymous-browsing',
      title: 'Anonymous Profile Viewing',
      description: 'View other profiles without leaving a trace',
      enabled: false
    },
    {
      id: 'hide-salary',
      title: 'Hide Salary Expectations',
      description: 'Keep your salary preferences private',
      enabled: false
    },
    {
      id: 'block-companies',
      title: 'Block Current/Past Employers',
      description: 'Prevent specific companies from seeing your profile',
      enabled: false
    },
    {
      id: 'show-online-status',
      title: 'Show Online Status',
      description: 'Let others see when you\'re active on CareerBox',
      enabled: true
    },
    {
      id: 'profile-views-tracking',
      title: 'Allow Profile View Tracking',
      description: 'Let others see that you viewed their profile',
      enabled: true
    }
  ]);

  const toggleEmailPreference = (id: string) => {
    setEmailPreferences(prev =>
      prev.map(pref =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const togglePrivacySetting = (id: string) => {
    setPrivacySettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleExportData = () => {
    // TODO: Implement actual data export
    alert('Your data export has been initiated. You will receive an email with a download link within 24 hours.');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement actual account deletion
    alert('Account deletion request submitted. Your account will be permanently deleted in 30 days.');
    setShowDeleteConfirm(false);
  };

  const handleEnableTwoFactor = () => {
    setShowTwoFactorSetup(true);
  };

  const tabs = [
    { id: 'email' as const, label: 'Email Preferences', icon: Mail },
    { id: 'privacy' as const, label: 'Privacy Controls', icon: Eye },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'data' as const, label: 'Data & Account', icon: Download }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Email Preferences Tab */}
            {activeTab === 'email' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Email Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose which emails you want to receive from CareerBox
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emailPreferences.map((pref) => (
                      <div
                        key={pref.id}
                        className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {pref.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {pref.description}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleEmailPreference(pref.id)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                            pref.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              pref.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Save Email Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy Controls Tab */}
            {activeTab === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Privacy Controls
                  </CardTitle>
                  <CardDescription>
                    Control who can see your profile and activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {privacySettings.map((setting) => (
                      <div
                        key={setting.id}
                        className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {setting.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {setting.description}
                          </p>
                        </div>
                        <button
                          onClick={() => togglePrivacySetting(setting.id)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                            setting.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              setting.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-3">
                      <Lock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">
                          Your Privacy Matters
                        </h4>
                        <p className="text-sm text-blue-800">
                          Some privacy settings may limit your visibility to recruiters and impact your job search experience.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Save Privacy Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Two-Factor Authentication */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            2FA Status
                          </h4>
                          {twoFactorEnabled ? (
                            <Badge variant="success" className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {twoFactorEnabled
                            ? 'Your account is protected with two-factor authentication'
                            : 'Protect your account by requiring a code from your phone when signing in'}
                        </p>
                      </div>
                    </div>

                    {!twoFactorEnabled && !showTwoFactorSetup && (
                      <Button
                        onClick={handleEnableTwoFactor}
                        className="flex items-center gap-2"
                      >
                        <Smartphone className="h-4 w-4" />
                        Enable Two-Factor Authentication
                      </Button>
                    )}

                    {showTwoFactorSetup && !twoFactorEnabled && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900">Set up 2FA</h4>
                        
                        {/* QR Code Placeholder */}
                        <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
                          <div className="text-center">
                            <div className="h-48 w-48 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                              <Key className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Scan this QR code with your authenticator app
                            </p>
                            <code className="text-xs bg-gray-100 px-3 py-1 rounded">
                              JBSWY3DPEHPK3PXP
                            </code>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter the 6-digit code from your app
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => {
                              setTwoFactorEnabled(true);
                              setShowTwoFactorSetup(false);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Verify & Enable
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowTwoFactorSetup(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {twoFactorEnabled && (
                      <div className="space-y-4">
                        <Button
                          variant="destructive"
                          onClick={() => setTwoFactorEnabled(false)}
                          className="flex items-center gap-2"
                        >
                          <EyeOff className="h-4 w-4" />
                          Disable Two-Factor Authentication
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <Button className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Update Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Data & Account Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                {/* Export Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-blue-600" />
                      Export Your Data
                    </CardTitle>
                    <CardDescription>
                      Download a copy of your CareerBox data (GDPR compliant)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Request a download of your personal data including your profile, applications,
                      messages, and activity history. The export will be provided as a JSON file.
                    </p>
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Request Data Export
                    </Button>
                  </CardContent>
                </Card>

                {/* Delete Account */}
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Account
                    </CardTitle>
                    <CardDescription>
                      Permanently delete your CareerBox account and all associated data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showDeleteConfirm ? (
                      <>
                        <p className="text-sm text-gray-600 mb-4">
                          Once you delete your account, there is no going back. This action will:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
                          <li>Permanently delete your profile and all personal data</li>
                          <li>Remove all your applications and saved jobs</li>
                          <li>Delete all your messages and conversations</li>
                          <li>Cancel any active job alerts or notifications</li>
                        </ul>
                        <Button
                          variant="destructive"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete My Account
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-red-900 mb-2">
                              Are you absolutely sure?
                            </h4>
                            <p className="text-sm text-red-800 mb-4">
                              This action cannot be undone. This will permanently delete your account
                              and remove all your data from our servers.
                            </p>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-red-900 mb-2">
                                Type "DELETE" to confirm
                              </label>
                              <input
                                type="text"
                                placeholder="DELETE"
                                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                              />
                            </div>
                            <div className="flex gap-3">
                              <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                className="flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Yes, Delete My Account
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
