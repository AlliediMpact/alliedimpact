'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@allied-impact/ui';
import { Settings, Loader2, CheckCircle, Globe, Calendar, Clock, Palette } from 'lucide-react';

interface UserPreferences {
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  language: string;
  theme: 'light' | 'dark' | 'system';
}

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Johannesburg', label: 'South Africa (SAST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'zu', label: 'isiZulu' },
  { value: 'xh', label: 'isiXhosa' },
  { value: 'af', label: 'Afrikaans' },
];

export default function PreferencesSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'en',
    theme: 'system'
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
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
        
        if (docSnap.exists() && docSnap.data().preferences) {
          setPreferences(docSnap.data().preferences);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
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
          preferences,
          updatedAt: new Date()
        }, { merge: true });

        // Apply theme immediately
        if (preferences.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (preferences.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // System preference
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatExample = () => {
    const now = new Date();
    switch (preferences.dateFormat) {
      case 'MM/DD/YYYY':
        return `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
      case 'DD/MM/YYYY':
        return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      case 'YYYY-MM-DD':
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    }
  };

  const timeExample = () => {
    const now = new Date();
    if (preferences.timeFormat === '12h') {
      return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } else {
      return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
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
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your experience with My Projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Theme */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Appearance</h3>
            </div>
            
            <div className="space-y-2 pl-7">
              <label className="text-sm font-medium">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map((theme) => (
                  <label
                    key={theme}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      preferences.theme === theme
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme}
                      checked={preferences.theme === theme}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        theme: e.target.value as 'light' | 'dark' | 'system'
                      }))}
                      className="sr-only"
                    />
                    <div className="font-medium capitalize">{theme}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Timezone */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Region & Language</h3>
            </div>
            
            <div className="space-y-4 pl-7">
              <div className="space-y-2">
                <label htmlFor="timezone" className="text-sm font-medium">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={preferences.timezone}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    timezone: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="language" className="text-sm font-medium">
                  Language
                </label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    language: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Note: Full translations coming soon
                </p>
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Date & Time Format */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Date & Time</h3>
            </div>
            
            <div className="space-y-4 pl-7">
              <div className="space-y-2">
                <label htmlFor="dateFormat" className="text-sm font-medium">
                  Date Format
                </label>
                <select
                  id="dateFormat"
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    dateFormat: e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
                  }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (International)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Example: {formatExample()}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="timeFormat" className="text-sm font-medium">
                  Time Format
                </label>
                <select
                  id="timeFormat"
                  value={preferences.timeFormat}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    timeFormat: e.target.value as '12h' | '24h'
                  }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="12h">12-hour (AM/PM)</option>
                  <option value="24h">24-hour</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Example: {timeExample()}
                </p>
              </div>
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
