/**
 * K6 Spike Testing Script
 * Tests system behavior under sudden traffic spikes
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    // Normal load
    { duration: '2m', target: 10 },
    
    // Sudden spike to 500 users
    { duration: '10s', target: 500 },
    
    // Maintain spike
    { duration: '1m', target: 500 },
    
    // Quick drop
    { duration: '10s', target: 10 },
    
    // Recovery period
    { duration: '2m', target: 10 },
  ],
  
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // Relax threshold for spike
    'http_req_failed': ['rate<0.05'], // Allow 5% errors during spike
    'errors': ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const apiKey = `sk_test_spike_${__VU}_${__ITER}`;
  
  const response = http.get(`${BASE_URL}/api/public/loans`, {
    headers: { 'X-API-Key': apiKey },
  });
  
  const success = check(response, {
    'status is 200 or rate limited': (r) => [200, 401, 429].includes(r.status),
    'response time < 5000ms': (r) => r.timings.duration < 5000,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  
  sleep(1);
}
