'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Activity,
  CheckCircle,
  XCircle,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed';
  failureCount: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  createdAt: string;
}

const AVAILABLE_EVENTS = [
  { value: 'loan.created', label: 'Loan Created' },
  { value: 'loan.approved', label: 'Loan Approved' },
  { value: 'loan.rejected', label: 'Loan Rejected' },
  { value: 'loan.disbursed', label: 'Loan Disbursed' },
  { value: 'loan.payment_received', label: 'Loan Payment Received' },
  { value: 'loan.completed', label: 'Loan Completed' },
  { value: 'investment.created', label: 'Investment Created' },
  { value: 'investment.completed', label: 'Investment Completed' },
  { value: 'investment.dividend_paid', label: 'Dividend Paid' },
  { value: 'transaction.created', label: 'Transaction Created' },
  { value: 'transaction.completed', label: 'Transaction Completed' },
  { value: 'transaction.failed', label: 'Transaction Failed' },
  { value: 'crypto.order_created', label: 'Crypto Order Created' },
  { value: 'crypto.order_filled', label: 'Crypto Order Filled' },
  { value: 'crypto.order_cancelled', label: 'Crypto Order Cancelled' },
];

export function WebhooksManager() {
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);

  // Form state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const response = await fetch('/api/v1/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.data.webhooks);
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error('Please enter a webhook URL');
      return;
    }

    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    try {
      const response = await fetch('/api/v1/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          events: selectedEvents,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewWebhookSecret(data.data.webhook.secret);
        setWebhookUrl('');
        setSelectedEvents([]);
        await loadWebhooks();
        toast.success('Webhook created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create webhook');
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast.error('Failed to create webhook');
    }
  };

  const deleteWebhook = async (webhookId: string, url: string) => {
    if (!confirm(`Delete webhook for ${url}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/webhooks/${webhookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadWebhooks();
        toast.success('Webhook deleted');
      } else {
        toast.error('Failed to delete webhook');
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Failed to delete webhook');
    }
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Webhooks</h2>
          <p className="text-muted-foreground mt-2">
            Receive real-time notifications about events in your account
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook endpoint to receive event notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="url">Webhook URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/webhooks"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be a valid HTTPS URL
                </p>
              </div>
              <div>
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-3 mt-2 max-h-64 overflow-y-auto p-2 border rounded">
                  {AVAILABLE_EVENTS.map((event) => (
                    <div key={event.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={event.value}
                        checked={selectedEvents.includes(event.value)}
                        onCheckedChange={() => toggleEvent(event.value)}
                      />
                      <label
                        htmlFor={event.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {event.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createWebhook}>Create Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Webhook Secret Display */}
      {newWebhookSecret && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-green-900">
                Webhook Created Successfully
              </p>
              <p className="text-sm text-green-800">
                Save this signing secret securely. Use it to verify webhook signatures.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 p-2 bg-white rounded border text-xs break-all">
                  {newWebhookSecret}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(newWebhookSecret)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setNewWebhookSecret(null)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Webhook className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No webhooks configured. Create your first webhook to start receiving events.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Webhooks</CardTitle>
            <CardDescription>Manage your webhook endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Success</TableHead>
                  <TableHead>Failures</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-mono text-sm">
                      {webhook.url}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {webhook.events.length} events
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                    <TableCell className="text-sm">
                      {webhook.lastSuccessAt
                        ? new Date(webhook.lastSuccessAt).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {webhook.failureCount > 0 && (
                        <Badge variant="destructive">
                          {webhook.failureCount}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteWebhook(webhook.id, webhook.url)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Documentation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Security</CardTitle>
          <CardDescription>Verify webhook signatures to ensure authenticity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Signature Verification</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Each webhook includes an <code>X-Webhook-Signature</code> header for verification:
            </p>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const parts = signature.split(',');
  const timestamp = parts[0].split('=')[1];
  const receivedSig = parts[1].split('=')[1];
  
  const signedPayload = \`\${timestamp}.\${JSON.stringify(payload)}\`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(receivedSig),
    Buffer.from(expectedSig)
  );
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
