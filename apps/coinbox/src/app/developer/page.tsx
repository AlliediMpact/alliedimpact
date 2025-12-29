'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeysManager } from '@/components/developer/ApiKeysManager';
import { ApiUsageDashboard } from '@/components/developer/ApiUsageDashboard';
import { WebhooksManager } from '@/components/developer/WebhooksManager';
import { Key, Activity, Webhook, Book } from 'lucide-react';

export default function DeveloperPortalPage() {
  const [activeTab, setActiveTab] = useState('api-keys');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Developer Portal</h1>
        <p className="text-muted-foreground">
          Build applications with the Coin Box API
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <ApiKeysManager />
        </TabsContent>

        <TabsContent value="usage">
          <ApiUsageDashboard />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhooksManager />
        </TabsContent>

        <TabsContent value="docs">
          <div className="space-y-6">
            <div className="prose max-w-none">
              <h2>API Documentation</h2>
              <p>
                Welcome to the Coin Box API documentation. Our API allows you to programmatically
                manage loans, investments, transactions, and crypto orders.
              </p>

              <h3>Getting Started</h3>
              <ol>
                <li>Create an API key in the API Keys tab</li>
                <li>Include the key in the Authorization header of your requests</li>
                <li>Start making requests to our endpoints</li>
              </ol>

              <h3>Authentication</h3>
              <p>Include your API key in the Authorization header:</p>
              <pre className="bg-muted p-4 rounded">
{`Authorization: Bearer cb_live_your_api_key_here`}
              </pre>

              <h3>Base URL</h3>
              <pre className="bg-muted p-4 rounded">
{`https://coinbox.example.com/api/v1`}
              </pre>

              <h3>Rate Limits</h3>
              <ul>
                <li><strong>Basic:</strong> 10 requests/minute, 100/hour, 1,000/day</li>
                <li><strong>Pro:</strong> 100 requests/minute, 1,000/hour, 10,000/day</li>
                <li><strong>Enterprise:</strong> 1,000 requests/minute, 10,000/hour, 100,000/day</li>
              </ul>

              <h3>Endpoints</h3>
              
              <h4>Loans</h4>
              <ul>
                <li><code>GET /api/v1/loans</code> - List loans</li>
                <li><code>GET /api/v1/loans/:id</code> - Get loan details</li>
                <li><code>POST /api/v1/loans</code> - Create a loan</li>
              </ul>

              <h4>Investments</h4>
              <ul>
                <li><code>GET /api/v1/investments</code> - List investments</li>
                <li><code>POST /api/v1/investments</code> - Create an investment</li>
              </ul>

              <h4>Transactions</h4>
              <ul>
                <li><code>GET /api/v1/transactions</code> - List transactions</li>
              </ul>

              <h4>Crypto Orders</h4>
              <ul>
                <li><code>GET /api/v1/crypto/orders</code> - List crypto orders</li>
                <li><code>POST /api/v1/crypto/orders</code> - Create a crypto order</li>
              </ul>

              <h3>Example: Create a Loan</h3>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`curl -X POST https://coinbox.example.com/api/v1/loans \\
  -H "Authorization: Bearer cb_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 10000,
    "interestRate": 5.5,
    "term": 36,
    "type": "personal",
    "purpose": "Home improvement"
  }'`}
              </pre>

              <h3>Response Format</h3>
              <pre className="bg-muted p-4 rounded text-sm">
{`{
  "success": true,
  "data": {
    "loan": {
      "id": "loan_123abc",
      "amount": 10000,
      "interestRate": 5.5,
      "term": 36,
      "type": "personal",
      "status": "pending",
      "createdAt": "2025-12-16T10:30:00Z"
    }
  },
  "message": "Loan created successfully"
}`}
              </pre>

              <h3>Error Handling</h3>
              <p>The API uses standard HTTP status codes:</p>
              <ul>
                <li><code>200</code> - Success</li>
                <li><code>201</code> - Created</li>
                <li><code>400</code> - Bad Request</li>
                <li><code>401</code> - Unauthorized</li>
                <li><code>403</code> - Forbidden</li>
                <li><code>404</code> - Not Found</li>
                <li><code>429</code> - Rate Limit Exceeded</li>
                <li><code>500</code> - Internal Server Error</li>
              </ul>

              <h3>SDKs</h3>
              <p>Official SDKs are available for:</p>
              <ul>
                <li>JavaScript/TypeScript (npm: @coinbox/sdk)</li>
                <li>Python (pip: coinbox-python)</li>
              </ul>

              <h3>Support</h3>
              <p>
                For API support, please contact <a href="mailto:api@coinbox.com">api@coinbox.com</a>
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
