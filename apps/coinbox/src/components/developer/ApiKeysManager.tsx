'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Key, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  tier: 'basic' | 'pro' | 'enterprise';
  permissions: string[];
  status: 'active' | 'revoked';
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  requestCount: number;
}

export function ApiKeysManager() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{
    key: string;
    name: string;
  } | null>(null);

  // Form state
  const [keyName, setKeyName] = useState('');
  const [keyTier, setKeyTier] = useState<'basic' | 'pro' | 'enterprise'>('basic');
  const [expiryDays, setExpiryDays] = useState<number>(365);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/v1/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.data.keys);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!keyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      const response = await fetch('/api/v1/api-keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: keyName,
          tier: keyTier,
          expiresIn: expiryDays * 24 * 60 * 60 * 1000, // Convert to ms
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewKeyData({
          key: data.data.key,
          name: data.data.name,
        });
        setKeyName('');
        setKeyTier('basic');
        setExpiryDays(365);
        await loadApiKeys();
        toast.success('API key created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const revokeApiKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to revoke "${keyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadApiKeys();
        toast.success('API key revoked');
      } else {
        toast.error('Failed to revoke API key');
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error('Failed to revoke API key');
    }
  };

  const rotateApiKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Rotate API key "${keyName}"? The old key will be immediately revoked.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/api-keys/${keyId}/rotate`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setNewKeyData({
          key: data.data.newKey.key,
          name: data.data.newKey.name,
        });
        await loadApiKeys();
        toast.success('API key rotated successfully');
      } else {
        toast.error('Failed to rotate API key');
      }
    } catch (error) {
      console.error('Error rotating API key:', error);
      toast.error('Failed to rotate API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">API Keys</h2>
          <p className="text-muted-foreground mt-2">
            Manage your API keys for programmatic access to Coin Box
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for your application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  placeholder="My Application"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tier">Tier</Label>
                <Select value={keyTier} onValueChange={(v: any) => setKeyTier(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (10 req/min)</SelectItem>
                    <SelectItem value="pro">Pro (100 req/min)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (1000 req/min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expiry">Expiry (days)</Label>
                <Input
                  id="expiry"
                  type="number"
                  min="1"
                  max="730"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createApiKey}>Create Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Key Display */}
      {newKeyData && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-green-900">
                API Key Created: {newKeyData.name}
              </p>
              <p className="text-sm text-green-800">
                Save this key securely. It won't be shown again!
              </p>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 p-2 bg-white rounded border text-xs break-all">
                  {newKeyData.key}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(newKeyData.key)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setNewKeyData(null)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No API keys yet. Create your first key to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {apiKeys.map((key) => (
            <Card key={key.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {key.name}
                      <Badge className={getTierColor(key.tier)}>
                        {key.tier}
                      </Badge>
                      <Badge className={getStatusColor(key.status)}>
                        {key.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="font-mono">
                      {key.keyPrefix}••••••••••••••••••
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {key.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rotateApiKey(key.id, key.name)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => revokeApiKey(key.id, key.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Used</p>
                    <p className="font-medium">
                      {key.lastUsedAt 
                        ? new Date(key.lastUsedAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Requests</p>
                    <p className="font-medium">{key.requestCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-medium">
                      {key.expiresAt 
                        ? new Date(key.expiresAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
