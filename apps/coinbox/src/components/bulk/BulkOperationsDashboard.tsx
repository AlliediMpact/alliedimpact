'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  Bitcoin, 
  MessageSquare, 
  Download,
  Zap,
  Info,
  Shield
} from 'lucide-react';
import BulkLoanForm from './BulkLoanForm';
import BulkInvestmentForm from './BulkInvestmentForm';
import BulkCryptoOrderForm from './BulkCryptoOrderForm';
import BulkMessageComposer from './BulkMessageComposer';
import BulkExportForm from './BulkExportForm';
import { useAuth } from '@/hooks/useAuth';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  limit: string;
  status: 'active' | 'beta' | 'coming-soon';
}

function FeatureCard({ icon, title, description, limit, status }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm mt-1">{description}</CardDescription>
            </div>
          </div>
          <Badge 
            variant={status === 'active' ? 'default' : status === 'beta' ? 'secondary' : 'outline'}
            className={status === 'active' ? 'bg-green-500' : ''}
          >
            {status === 'active' ? 'Active' : status === 'beta' ? 'Beta' : 'Coming Soon'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600">
          <strong>Limit:</strong> {limit}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BulkOperationsDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const isAdmin = user?.role === 'admin' || user?.role === 'support';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Zap className="h-8 w-8 text-blue-500" />
          Bulk Operations
        </h1>
        <p className="text-gray-600 mt-2">
          Process multiple operations efficiently with our bulk tools
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-500 bg-blue-50">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Phase 7 Feature:</strong> Bulk operations allow you to create multiple items, 
          export data, and manage communications at scale. All operations are logged for audit purposes.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          {isAdmin && <TabsTrigger value="messages">Messages</TabsTrigger>}
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Statistics Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your bulk operations summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Operations</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-600">0</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">0</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Compliance
                </CardTitle>
                <CardDescription>All operations are audited</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    All actions are logged and timestamped
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    Transaction-safe processing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    Rate limiting protection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    Role-based access control
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Available Features */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<FileText className="h-5 w-5 text-blue-500" />}
                title="Bulk Loans"
                description="Create multiple loan tickets at once"
                limit="20 loans per batch"
                status="active"
              />
              
              <FeatureCard
                icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                title="Bulk Investments"
                description="Process multiple investments simultaneously"
                limit="20 investments per batch"
                status="active"
              />
              
              <FeatureCard
                icon={<Bitcoin className="h-5 w-5 text-orange-500" />}
                title="Bulk Crypto Orders"
                description="Create multiple crypto orders"
                limit="20 orders per batch"
                status="active"
              />
              
              {isAdmin && (
                <FeatureCard
                  icon={<MessageSquare className="h-5 w-5 text-purple-500" />}
                  title="Bulk Messages"
                  description="Send messages to multiple users"
                  limit="50 recipients per batch"
                  status="active"
                />
              )}
              
              <FeatureCard
                icon={<Download className="h-5 w-5 text-indigo-500" />}
                title="Data Export"
                description="Export your data in various formats"
                limit="10,000 records per export"
                status="active"
              />
            </div>
          </div>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>Tips for using bulk operations effectively</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Badge className="mt-1">1</Badge>
                  <div>
                    <strong>Start Small:</strong> Test with a few items before running large batches
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-1">2</Badge>
                  <div>
                    <strong>Validate Data:</strong> Ensure all data is correct before submission
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-1">3</Badge>
                  <div>
                    <strong>Use Templates:</strong> Download CSV templates for easier data entry
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-1">4</Badge>
                  <div>
                    <strong>Check Results:</strong> Review batch results to catch any errors
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-1">5</Badge>
                  <div>
                    <strong>Monitor Limits:</strong> Respect tier limits and batch size restrictions
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans">
          <BulkLoanForm />
        </TabsContent>

        {/* Investments Tab */}
        <TabsContent value="investments">
          <BulkInvestmentForm />
        </TabsContent>

        {/* Crypto Tab */}
        <TabsContent value="crypto">
          <BulkCryptoOrderForm />
        </TabsContent>

        {/* Messages Tab */}
        {isAdmin && (
          <TabsContent value="messages">
            <BulkMessageComposer />
          </TabsContent>
        )}

        {/* Export Tab */}
        <TabsContent value="export">
          <BulkExportForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
