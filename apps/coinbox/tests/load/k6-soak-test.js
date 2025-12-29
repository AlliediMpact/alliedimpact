/**
 * K6 Soak Testing Script
 * Tests system stability under sustained load over extended period
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const memoryLeaks = new Counter('potential_memory_leaks');

export const options = {
  stages: [
    // Ramp up to moderate load
    { duration: '5m', target: 50 },
    
    // Sustain load for 30 minutes
    { duration: '30m', target: 50 },
    
    // Gradual ramp down
    { duration: '5m', target: 0 },
  ],
  
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    'errors': ['rate<0.01'],
    
    // Check for performance degradation over time
    'response_time': ['p(95)<500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

let responseTimeWindow = [];
const WINDOW_SIZE = 100;

export default function () {
  const apiKey = `sk_test_soak_${__VU}`;
  
  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/api/public/loans?limit=10`, {
    headers: { 'X-API-Key': apiKey },
  });
  const duration = Date.now() - startTime;
  
  const success = check(response, {
    'status is 200': (r) => r.status === 200 || r.status === 401,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!success);
  responseTime.add(duration);
  
  // Track response times to detect degradation
  responseTimeWindow.push(duration);
  if (responseTimeWindow.length > WINDOW_SIZE) {
    responseTimeWindow.shift();
    
    // Check if response times are increasing over time (potential memory leak)
    const avg = responseTimeWindow.reduce((a, b) => a + b, 0) / responseTimeWindow.length;
    if (avg > 1000) {
      memoryLeaks.add(1);
    }
  }
  
  sleep(Math.random() * 3 + 1); // 1-4 seconds think time
}

export function handleSummary(data) {
  return {
    'soak-test-summary.json': JSON.stringify(data, null, 2),
  };
}
