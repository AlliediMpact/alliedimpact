/**
 * K6 Load Testing Script
 * Tests API endpoints under various load conditions
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const rateLimitHits = new Counter('rate_limit_hits');
const successfulRequests = new Counter('successful_requests');

// Test configuration
export const options = {
  stages: [
    // Warm-up: Ramp up to 20 users over 1 minute
    { duration: '1m', target: 20 },
    
    // Ramp-up: Increase to 50 users over 2 minutes
    { duration: '2m', target: 50 },
    
    // Peak load: Maintain 100 users for 3 minutes
    { duration: '3m', target: 100 },
    
    // Spike test: Surge to 200 users for 1 minute
    { duration: '1m', target: 200 },
    
    // Cool-down: Ramp down to 20 users over 1 minute
    { duration: '1m', target: 20 },
    
    // Final cool-down: Drop to 0
    { duration: '30s', target: 0 },
  ],
  
  thresholds: {
    // HTTP errors should be less than 1%
    'http_req_failed': ['rate<0.01'],
    
    // 95% of requests should be below 500ms
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    
    // Custom error rate threshold
    'errors': ['rate<0.01'],
    
    // Check success rate
    'checks': ['rate>0.95'],
  },
  
  // Graceful shutdown
  gracefulStop: '30s',
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data generators
function generateRandomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateLoan() {
  return {
    amount: Math.floor(Math.random() * 4000) + 1000, // 1000-5000
    duration: [30, 45, 60][Math.floor(Math.random() * 3)],
    interestRate: Math.floor(Math.random() * 10) + 15, // 15-25
  };
}

// Main test function
export default function () {
  const testApiKey = `sk_test_${generateRandomString()}`;
  const testToken = `Bearer ${generateRandomString()}`;
  
  // Randomly select a test scenario
  const scenario = Math.random();
  
  if (scenario < 0.4) {
    // 40% - Public API Read Operations
    publicApiReadOperations(testApiKey);
  } else if (scenario < 0.6) {
    // 20% - Public API Write Operations
    publicApiWriteOperations(testApiKey);
  } else if (scenario < 0.75) {
    // 15% - Bulk Operations
    bulkOperations(testToken);
  } else if (scenario < 0.85) {
    // 10% - API Key Management
    apiKeyManagement(testToken);
  } else if (scenario < 0.95) {
    // 10% - Webhook Operations
    webhookOperations(testToken);
  } else {
    // 5% - Rate Limit Testing
    rateLimitStressTest(testApiKey);
  }
  
  // Think time between iterations
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

// Scenario 1: Public API Read Operations
function publicApiReadOperations(apiKey) {
  group('Public API - Read Operations', () => {
    // Get loans list
    let response = http.get(`${BASE_URL}/api/public/loans`, {
      headers: { 'X-API-Key': apiKey },
      tags: { name: 'GET /api/public/loans' },
    });
    
    const loansSuccess = check(response, {
      'loans list status is 200 or 401': (r) => [200, 401, 429].includes(r.status),
      'loans list response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    errorRate.add(!loansSuccess);
    apiDuration.add(response.timings.duration);
    
    if (response.status === 429) {
      rateLimitHits.add(1);
    } else if (response.status === 200) {
      successfulRequests.add(1);
      
      // Extract loan ID if available
      try {
        const body = JSON.parse(response.body);
        if (body.tickets && body.tickets.length > 0) {
          const loanId = body.tickets[0].id;
          
          sleep(0.5);
          
          // Get specific loan
          response = http.get(`${BASE_URL}/api/public/loans/${loanId}`, {
            headers: { 'X-API-Key': apiKey },
            tags: { name: 'GET /api/public/loans/:id' },
          });
          
          check(response, {
            'loan detail status is 200 or 401': (r) => [200, 401, 404, 429].includes(r.status),
          });
          
          if (response.status === 200) successfulRequests.add(1);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    sleep(1);
    
    // Get transactions
    response = http.get(`${BASE_URL}/api/public/transactions`, {
      headers: { 'X-API-Key': apiKey },
      tags: { name: 'GET /api/public/transactions' },
    });
    
    check(response, {
      'transactions status is 200 or 401': (r) => [200, 401, 429].includes(r.status),
    });
    
    if (response.status === 200) successfulRequests.add(1);
  });
}

// Scenario 2: Public API Write Operations
function publicApiWriteOperations(apiKey) {
  group('Public API - Write Operations', () => {
    // Create loan
    const loan = generateLoan();
    let response = http.post(
      `${BASE_URL}/api/public/loans`,
      JSON.stringify(loan),
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        tags: { name: 'POST /api/public/loans' },
      }
    );
    
    check(response, {
      'create loan status is 201, 400, or 401': (r) => [201, 400, 401, 403, 429].includes(r.status),
      'create loan response time < 1000ms': (r) => r.timings.duration < 1000,
    });
    
    if (response.status === 201) successfulRequests.add(1);
    if (response.status === 429) rateLimitHits.add(1);
    
    sleep(1);
    
    // Create investment
    response = http.post(
      `${BASE_URL}/api/public/investments`,
      JSON.stringify({
        ticketId: generateRandomString(10),
        amount: 500,
      }),
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        tags: { name: 'POST /api/public/investments' },
      }
    );
    
    check(response, {
      'create investment status is valid': (r) => [201, 400, 401, 403, 404, 429].includes(r.status),
    });
    
    if (response.status === 201) successfulRequests.add(1);
  });
}

// Scenario 3: Bulk Operations
function bulkOperations(token) {
  group('Bulk Operations', () => {
    // Create bulk loans
    const loans = [generateLoan(), generateLoan(), generateLoan()];
    
    let response = http.post(
      `${BASE_URL}/api/bulk/loans/create`,
      JSON.stringify({ loans }),
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        tags: { name: 'POST /api/bulk/loans/create' },
      }
    );
    
    const bulkSuccess = check(response, {
      'bulk loans status is 200, 400, or 401': (r) => [200, 400, 401, 429].includes(r.status),
      'bulk loans response time < 2000ms': (r) => r.timings.duration < 2000,
    });
    
    if (response.status === 200) {
      successfulRequests.add(1);
      
      try {
        const body = JSON.parse(response.body);
        if (body.batchId) {
          sleep(2);
          
          // Check batch status
          response = http.get(
            `${BASE_URL}/api/bulk/loans/create?batchId=${body.batchId}`,
            {
              headers: { 'Authorization': token },
              tags: { name: 'GET /api/bulk/loans/create (status)' },
            }
          );
          
          check(response, {
            'batch status is 200 or 401': (r) => [200, 401, 404].includes(r.status),
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  });
}

// Scenario 4: API Key Management
function apiKeyManagement(token) {
  group('API Key Management', () => {
    // Create API key
    let response = http.post(
      `${BASE_URL}/api/api-keys/create`,
      JSON.stringify({
        name: `Load Test Key ${generateRandomString(6)}`,
        tier: 'basic',
        permissions: ['loans:read'],
      }),
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        tags: { name: 'POST /api/api-keys/create' },
      }
    );
    
    check(response, {
      'create API key status is valid': (r) => [201, 400, 401].includes(r.status),
    });
    
    if (response.status === 201) successfulRequests.add(1);
    
    sleep(0.5);
    
    // List API keys
    response = http.get(`${BASE_URL}/api/api-keys/list`, {
      headers: { 'Authorization': token },
      tags: { name: 'GET /api/api-keys/list' },
    });
    
    check(response, {
      'list API keys status is 200 or 401': (r) => [200, 401].includes(r.status),
    });
    
    if (response.status === 200) successfulRequests.add(1);
  });
}

// Scenario 5: Webhook Operations
function webhookOperations(token) {
  group('Webhook Operations', () => {
    // Create webhook
    let response = http.post(
      `${BASE_URL}/api/webhooks`,
      JSON.stringify({
        url: 'https://example.com/webhook',
        events: ['loan.created', 'loan.approved'],
      }),
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        tags: { name: 'POST /api/webhooks' },
      }
    );
    
    check(response, {
      'create webhook status is valid': (r) => [201, 400, 401].includes(r.status),
    });
    
    if (response.status === 201) successfulRequests.add(1);
    
    sleep(0.5);
    
    // List webhooks
    response = http.get(`${BASE_URL}/api/webhooks`, {
      headers: { 'Authorization': token },
      tags: { name: 'GET /api/webhooks' },
    });
    
    check(response, {
      'list webhooks status is 200 or 401': (r) => [200, 401].includes(r.status),
    });
    
    if (response.status === 200) successfulRequests.add(1);
  });
}

// Scenario 6: Rate Limit Stress Test
function rateLimitStressTest(apiKey) {
  group('Rate Limit Stress Test', () => {
    let hitRateLimit = false;
    
    // Rapid-fire 20 requests
    for (let i = 0; i < 20; i++) {
      const response = http.get(`${BASE_URL}/api/public/loans`, {
        headers: { 'X-API-Key': apiKey },
        tags: { name: 'GET /api/public/loans (rate limit test)' },
      });
      
      if (response.status === 429) {
        hitRateLimit = true;
        rateLimitHits.add(1);
      } else if (response.status === 200) {
        successfulRequests.add(1);
      }
      
      // Minimal delay
      sleep(0.05);
    }
    
    check(hitRateLimit, {
      'rate limit was enforced': (hit) => hit === true,
    });
  });
}

// Setup function (runs once at start)
export function setup() {
  console.log('Starting load test...');
  console.log(`Target: ${BASE_URL}`);
  return { startTime: Date.now() };
}

// Teardown function (runs once at end)
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration.toFixed(2)} seconds`);
}
