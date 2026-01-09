'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@allied-impact/ui';
import { Bell, Loader2, CheckCircle } from 'lucide-react';

interface NotificationSettings {
  email: {
    milestones: boolean;
    deliverables: boolean;
    tickets: boolean;
    deadlines: boolean;
    weeklyDigest: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
  };
  frequency: 'instant' | 'daily' | 'weekly';
}

export default function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      milestones: true,
      deliverables: true,
      tickets: true,
      deadlines: true,
      weeklyDigest: false
    },
    inApp: {
      enabled: true,
      sound: true
    },
    frequency: 'instant'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { getAuthInstance } = await import('@allied-impact/auth');
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const auth = getAuthInstance();
      if (auth.currentUser) {
        const db = getFirestore(getApp());
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().notificationSettings) {
          setSettings(docSnap.data().notificationSettings);
        }
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const { getAuthInstance } = await import('@allied-impact/auth');
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const auth = getAuthInstance();
      if (auth.currentUser) {
        const db = getFirestore(getApp());
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          notificationSettings: settings,
          updatedAt: new Date()
        }, { merge: true });

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how and when you want to be notified
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Email Notifications</h3>
            </div>
            
            <div className="space-y-3 pl-7">
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                <div>
                  <div className="font-medium">Milestone Updates</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified when milestones are created, updated, or completed
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email.milestones}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, milestones: e.target.checked }
                  }))}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                <div>
                  <div className="font-medium">Deliverable Updates</div>
                  <div className="text-sm text-muted-foreground">
                    Notifications about deliverable status changes and approvals
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email.deliverables}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, deliverables: e.target.checked }
                  }))}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                <div>
                  <div className="font-medium">Ticket Replies</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified when someone replies to your support tickets
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email.tickets}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, tickets: e.target.checked }
                  }))}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                <div>
                  <div className="font-medium">Deadline Reminders</div>
                  <div className="text-sm text-muted-foreground">
                    Reminders about upcoming deadlines and overdue items
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email.deadlines}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, deadlines: e.target.checked }
                  }))}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                <div>
                  <div className="font-medium">Weekly Digest</div>
                  <div className="text-sm text-muted-foreground">
                    Weekly summary of all project activity
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email.weeklyDigest}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, weeklyDigest: e.target.checked }
                  }))}
                  className="h-4 w-4"
                />
              </label>
            </div>
          </div>

          <div className="border-t pt-6" />

          {/* Notification Frequency */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Frequency</h3>
            
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value="instant"
                  checked={settings.frequency === 'instant'}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    frequency: e.target.value as 'instant' | 'daily' | 'weekly'
                  }))}
                  className="h-4 w-4"
                />
                <div>
                  <div className="font-medium">Instant</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified immediately when events happen
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value="daily"
                  checked={settings.frequency === 'daily'}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    frequency: e.target.value as 'instant' | 'daily' | 'weekly'
                  }))}
                  className="h-4 w-4"
                />
                <div>
                  <div className="font-medium">Daily Digest</div>
                  <div className="text-sm text-muted-foreground">
                    Receive a daily summary at 9:00 AM
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value="weekly"
                  checked={settings.frequency === 'weekly'}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    frequency: e.target.value as 'instant' | 'daily' | 'weekly'
                  }))}
                  className="h-4 w-4"
                />
                <div>
                  <div className="font-medium">Weekly Digest</div>
                  <div className="text-sm text-muted-foreground">
                    Receive a weekly summary every Monday
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t pt-6" />

          {/* In-App Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">In-App Notifications</h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                <div>
                  <div className="font-medium">Enable In-App Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Show notification bell icon in header
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.inApp.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    inApp: { ...prev.inApp, enabled: e.target.checked }
                  }))}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                <div>
                  <div className="font-medium">Notification Sound</div>
                  <div className="text-sm text-muted-foreground">
                    Play sound when new notifications arrive
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.inApp.sound}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    inApp: { ...prev.inApp, sound: e.target.checked }
                  }))}
                  className="h-4 w-4"
                  disabled={!settings.inApp.enabled}
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
            
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Preferences saved successfully
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
