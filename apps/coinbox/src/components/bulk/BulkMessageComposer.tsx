'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Loader2, CheckCircle2, XCircle, Users, MessageSquare } from 'lucide-react';

interface RecipientEntry {
  userId: string;
  email?: string;
  status?: 'pending' | 'success' | 'error';
  error?: string;
}

interface BulkMessageResult {
  batchId: string;
  totalProcessed: number;
  successful: number;
  failed: number;
  results: Array<{
    index: number;
    success: boolean;
    error?: string;
  }>;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Regular messages' },
  { value: 'normal', label: 'Normal', description: 'Standard priority' },
  { value: 'high', label: 'High', description: 'Important notifications' },
  { value: 'urgent', label: 'Urgent', description: 'Critical alerts' }
];

const RECIPIENT_GROUPS = [
  { value: 'all_users', label: 'All Users' },
  { value: 'active_investors', label: 'Active Investors' },
  { value: 'active_borrowers', label: 'Active Borrowers' },
  { value: 'premium_tier', label: 'Premium Tier' },
  { value: 'gold_tier', label: 'Gold Tier' },
  { value: 'platinum_tier', label: 'Platinum Tier' }
];

export default function BulkMessageComposer() {
  const { user } = useAuth();
  const [recipients, setRecipients] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<string>('normal');
  const [sendEmail, setSendEmail] = useState(false);
  const [sendPush, setSendPush] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BulkMessageResult | null>(null);
  const [error, setError] = useState<string>('');
  const [recipientCount, setRecipientCount] = useState(0);

  const parseRecipients = (): string[] => {
    if (!recipients.trim()) return [];
    
    // Split by comma, semicolon, or newline
    return recipients
      .split(/[,;\n]+/)
      .map(r => r.trim())
      .filter(r => r.length > 0);
  };

  const updateRecipientCount = (value: string) => {
    setRecipients(value);
    const parsed = value.split(/[,;\n]+/).map(r => r.trim()).filter(r => r.length > 0);
    setRecipientCount(parsed.length);
    setError('');
  };

  const validateForm = (): string | null => {
    const recipientList = parseRecipients();

    if (recipientList.length === 0 && !selectedGroup) {
      return 'Please add recipients or select a group';
    }

    if (recipientList.length > 50) {
      return 'Maximum 50 recipients per batch';
    }

    if (!subject.trim()) {
      return 'Subject is required';
    }

    if (subject.length > 200) {
      return 'Subject must be 200 characters or less';
    }

    if (!message.trim()) {
      return 'Message is required';
    }

    if (message.length > 2000) {
      return 'Message must be 2000 characters or less';
    }

    if (!sendEmail && !sendPush) {
      return 'Select at least one delivery method (Email or Push)';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      const recipientList = parseRecipients();

      const requestBody = {
        recipients: selectedGroup ? undefined : recipientList,
        recipientGroup: selectedGroup || undefined,
        subject: subject.trim(),
        message: message.trim(),
        priority,
        deliveryMethods: {
          email: sendEmail,
          push: sendPush
        }
      };

      const response = await fetch('/api/bulk/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send messages');
      }

      setResult(data);

      // Clear form on success
      if (data.successful === data.totalProcessed) {
        setRecipients('');
        setSelectedGroup('');
        setSubject('');
        setMessage('');
        setRecipientCount(0);
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleMessage = () => {
    setSubject('Important Platform Update');
    setMessage(`Dear User,

We are excited to announce new features available on the Coin Box platform:

• Enhanced security features
• Improved user interface
• New investment opportunities
• 24/7 customer support

Thank you for being a valued member of our community.

Best regards,
The Coin Box Team`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Bulk Message Composer
        </CardTitle>
        <CardDescription>
          Send messages to multiple users at once (max 50 recipients per batch)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipients Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient-group">Recipient Group (Optional)</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger id="recipient-group">
                  <SelectValue placeholder="Select a group or enter individual recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - Use individual recipients</SelectItem>
                  {RECIPIENT_GROUPS.map(group => (
                    <SelectItem key={group.value} value={group.value}>
                      {group.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!selectedGroup && (
              <div>
                <Label htmlFor="recipients">
                  Individual Recipients (User IDs or Emails)
                  <Badge variant="outline" className="ml-2">
                    {recipientCount}/50
                  </Badge>
                </Label>
                <Textarea
                  id="recipients"
                  value={recipients}
                  onChange={(e) => updateRecipientCount(e.target.value)}
                  placeholder="Enter user IDs or emails separated by commas, semicolons, or newlines&#10;Example:&#10;user1@example.com, user2@example.com&#10;user-id-123&#10;user-id-456"
                  rows={6}
                  disabled={isProcessing}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate recipients with commas, semicolons, or line breaks
                </p>
              </div>
            )}

            {selectedGroup && (
              <Alert className="border-blue-500 bg-blue-50">
                <Users className="h-4 w-4" />
                <AlertDescription>
                  Messages will be sent to all users in the <strong>{RECIPIENT_GROUPS.find(g => g.value === selectedGroup)?.label}</strong> group.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Message Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                maxLength={200}
                disabled={isProcessing}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {subject.length}/200 characters
              </p>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={10}
                maxLength={2000}
                disabled={isProcessing}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {message.length}/2000 characters
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadSampleMessage}
              disabled={isProcessing}
            >
              Load Sample Message
            </Button>
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Message Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Methods */}
          <div className="space-y-3">
            <Label>Delivery Methods</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-push"
                checked={sendPush}
                onCheckedChange={(checked) => setSendPush(checked as boolean)}
                disabled={isProcessing}
              />
              <Label htmlFor="send-push" className="font-normal cursor-pointer">
                Send Push Notification
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-email"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                disabled={isProcessing}
              />
              <Label htmlFor="send-email" className="font-normal cursor-pointer">
                Send Email
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isProcessing || (recipientCount === 0 && !selectedGroup)}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Messages...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send to {selectedGroup ? 'Group' : `${recipientCount} Recipient${recipientCount !== 1 ? 's' : ''}`}
              </>
            )}
          </Button>
        </form>

        {/* Results Summary */}
        {result && (
          <Alert className="mt-6 border-blue-500 bg-blue-50">
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Batch {result.batchId}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Processed</p>
                    <p className="text-lg font-bold">{result.totalProcessed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-lg font-bold text-green-600">{result.successful}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-lg font-bold text-red-600">{result.failed}</p>
                  </div>
                </div>
                {result.successful === result.totalProcessed && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ All messages sent successfully!
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
