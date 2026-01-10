'use client';

import { useState } from 'react';
import { Bell, Plus, Edit2, Trash2, MapPin, DollarSign, Briefcase, Clock, Mail, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

interface JobAlert {
  id: string;
  name: string;
  keywords: string[];
  location?: string;
  jobType?: string[];
  salaryMin?: number;
  experience?: string;
  frequency: 'instant' | 'daily' | 'weekly';
  active: boolean;
  createdAt: string;
  lastNotified?: string;
  matchCount: number;
}

export default function JobAlertsPage() {
  const [alerts, setAlerts] = useState<JobAlert[]>([
    {
      id: '1',
      name: 'Senior Software Engineer - Johannesburg',
      keywords: ['Senior Software Engineer', 'Full Stack Developer'],
      location: 'Johannesburg, GP',
      jobType: ['Full-time'],
      salaryMin: 60000,
      experience: 'senior',
      frequency: 'daily',
      active: true,
      createdAt: '2026-01-01',
      lastNotified: '2026-01-10',
      matchCount: 8
    },
    {
      id: '2',
      name: 'Remote React Developer',
      keywords: ['React', 'TypeScript', 'Frontend'],
      jobType: ['Full-time', 'Contract'],
      salaryMin: 45000,
      frequency: 'instant',
      active: true,
      createdAt: '2025-12-15',
      lastNotified: '2026-01-09',
      matchCount: 15
    },
    {
      id: '3',
      name: 'Cape Town Tech Jobs',
      keywords: ['Software Developer', 'DevOps', 'Cloud'],
      location: 'Cape Town, WC',
      frequency: 'weekly',
      active: false,
      createdAt: '2025-11-20',
      matchCount: 3
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    location: '',
    jobType: [] as string[],
    salaryMin: '',
    experience: 'all',
    frequency: 'daily' as 'instant' | 'daily' | 'weekly'
  });

  const handleCreateAlert = () => {
    if (!formData.name || !formData.keywords) {
      alert('Please fill in alert name and keywords');
      return;
    }

    const newAlert: JobAlert = {
      id: Date.now().toString(),
      name: formData.name,
      keywords: formData.keywords.split(',').map(k => k.trim()),
      location: formData.location || undefined,
      jobType: formData.jobType.length > 0 ? formData.jobType : undefined,
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
      experience: formData.experience !== 'all' ? formData.experience : undefined,
      frequency: formData.frequency,
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
      matchCount: 0
    };

    setAlerts(prev => [newAlert, ...prev]);
    resetForm();
    setShowCreateForm(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      keywords: '',
      location: '',
      jobType: [],
      salaryMin: '',
      experience: 'all',
      frequency: 'daily'
    });
  };

  const toggleAlertStatus = (id: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, active: !alert.active } : alert
      )
    );
  };

  const deleteAlert = (id: string) => {
    if (confirm('Are you sure you want to delete this job alert?')) {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'instant':
        return 'Instant';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      default:
        return frequency;
    }
  };

  const toggleJobType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      jobType: prev.jobType.includes(type)
        ? prev.jobType.filter(t => t !== type)
        : [...prev.jobType, type]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              Job Alerts
            </h1>
            <p className="text-gray-600 mt-2">
              Get notified when new jobs match your criteria
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Alert
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="mb-6 border-blue-200">
            <CardHeader>
              <CardTitle>Create New Job Alert</CardTitle>
              <CardDescription>
                Set your criteria and we'll notify you when matching jobs are posted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Alert Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Name *
                  </label>
                  <Input
                    placeholder="e.g., Senior Developer - Remote"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords * (comma-separated)
                  </label>
                  <Input
                    placeholder="e.g., React, TypeScript, Frontend Developer"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jobs matching any of these keywords will trigger an alert
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="City or province"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={formData.jobType.includes(type) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleJobType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Minimum Salary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Salary (monthly)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="e.g., 25000"
                        value={formData.salaryMin}
                        onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="all">All Levels</option>
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="mid">Mid Level (3-5 years)</option>
                      <option value="senior">Senior (5+ years)</option>
                      <option value="lead">Lead/Principal</option>
                    </select>
                  </div>
                </div>

                {/* Notification Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Frequency
                  </label>
                  <div className="flex gap-2">
                    {(['instant', 'daily', 'weekly'] as const).map((freq) => (
                      <Button
                        key={freq}
                        type="button"
                        variant={formData.frequency === freq ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData({ ...formData, frequency: freq })}
                        className="flex items-center gap-2"
                      >
                        <Bell className="h-4 w-4" />
                        {getFrequencyLabel(freq)}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.frequency === 'instant' && 'Receive emails immediately when jobs are posted'}
                    {formData.frequency === 'daily' && 'Receive a daily digest of new matching jobs'}
                    {formData.frequency === 'weekly' && 'Receive a weekly summary of new matching jobs'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleCreateAlert} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Create Alert
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No job alerts yet"
            description="Create your first alert to start receiving notifications about relevant job opportunities"
            action={{
              label: "Create Your First Alert",
              onClick: () => setShowCreateForm(true)
            }}
          />
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`transition-all ${
                  alert.active ? 'border-l-4 border-l-blue-600' : 'opacity-60'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Alert Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <Bell className={`h-5 w-5 flex-shrink-0 mt-0.5 ${alert.active ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {alert.name}
                            </h3>
                            {alert.active ? (
                              <Badge variant="success">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Paused</Badge>
                            )}
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getFrequencyLabel(alert.frequency)}
                            </Badge>
                          </div>
                          
                          {/* Alert Criteria */}
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex flex-wrap gap-2">
                              <span className="font-medium">Keywords:</span>
                              {alert.keywords.map((keyword, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                              {alert.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {alert.location}
                                </span>
                              )}
                              {alert.jobType && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  {alert.jobType.join(', ')}
                                </span>
                              )}
                              {alert.salaryMin && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  Min R{(alert.salaryMin / 1000).toFixed(0)}k
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>
                              Created {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                            {alert.lastNotified && (
                              <span>
                                Last notified {new Date(alert.lastNotified).toLocaleDateString()}
                              </span>
                            )}
                            {alert.matchCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {alert.matchCount} {alert.matchCount === 1 ? 'match' : 'matches'} this week
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAlertStatus(alert.id)}
                        className="flex items-center gap-2"
                      >
                        {alert.active ? (
                          <>
                            <X className="h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAlert(alert.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                        className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Email Preview Info */}
        {alerts.some(a => a.active) && (
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Email Notifications</h4>
                  <p className="text-sm text-blue-800">
                    You have {alerts.filter(a => a.active).length} active {alerts.filter(a => a.active).length === 1 ? 'alert' : 'alerts'}. 
                    Matching jobs will be sent to your registered email address based on your frequency preferences.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
