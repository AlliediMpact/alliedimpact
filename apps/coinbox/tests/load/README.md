# Load Testing Suite

Comprehensive load testing for Coin Box API using Artillery and k6.

## Prerequisites

### Artillery
```bash
npm install -g artillery
npm install
```

### k6
Download and install k6:
- **Windows**: `choco install k6` or download from [k6.io](https://k6.io/docs/get-started/installation/)
- **macOS**: `brew install k6`
- **Linux**: `sudo snap install k6`

## Test Scenarios

### 1. Artillery Load Tests (`artillery.yml`)

**Duration**: ~8 minutes  
**Max Users**: 200 concurrent users/sec  
**Coverage**: All API endpoints with weighted scenarios

```bash
npm run artillery:basic
```

Generate HTML report:
```bash
npm run artillery:report
```

**Phases**:
- Warm-up (60s): 5 users/sec
- Ramp-up (120s): 10→50 users/sec
- Peak load (180s): 100 users/sec
- Spike (60s): 200 users/sec
- Cool-down (60s): 20 users/sec

**Scenarios** (weighted):
- 40% Public API reads
- 20% Public API writes
- 15% Bulk operations
- 10% API key management
- 10% Webhook operations
- 5% Rate limit stress

### 2. K6 Load Test (`k6-load-test.js`)

**Duration**: ~9.5 minutes  
**Max Users**: 200 VUs (Virtual Users)

```bash
npm run k6:load
```

Run with custom environment:
```bash
BASE_URL=https://api.coinbox.com k6 run k6-load-test.js
```

**Stages**:
1. Warm-up: 0→20 users (1m)
2. Ramp-up: 20→50 users (2m)
3. Peak: 50→100 users (3m)
4. Spike: 100→200 users (1m)
5. Cool-down: 200→20 users (1m)
6. Final: 20→0 users (30s)

**Thresholds**:
- Error rate < 1%
- P95 response time < 500ms
- P99 response time < 1000ms
- Check success rate > 95%

### 3. K6 Spike Test (`k6-spike-test.js`)

Tests sudden traffic surges.

**Duration**: ~5 minutes  
**Max Users**: 500 VUs

```bash
npm run k6:spike
```

**Pattern**:
- Normal: 10 users (2m)
- Spike: 10→500 users (10s)
- Sustain: 500 users (1m)
- Drop: 500→10 users (10s)
- Recovery: 10 users (2m)

**Thresholds**:
- P95 < 2000ms (relaxed for spike)
- Error rate < 5% (allows some failures)

### 4. K6 Soak Test (`k6-soak-test.js`)

Tests stability over extended period.

**Duration**: 40 minutes  
**Load**: 50 VUs sustained

```bash
npm run k6:soak
```

**Pattern**:
- Ramp-up: 0→50 users (5m)
- Sustain: 50 users (30m)
- Ramp-down: 50→0 users (5m)

**Monitoring**:
- Response time degradation
- Memory leak detection
- Error rate stability

## Quick Tests

### 2-Minute Quick Test
```bash
npm run test:quick
```

### Full Test Suite
```bash
npm run test:full
```

## Performance Targets

### Response Times
- **P50** (median): < 200ms
- **P95**: < 500ms
- **P99**: < 1000ms

### Availability
- **Uptime**: > 99.9%
- **Error rate**: < 1%
- **Rate limit handling**: Graceful 429 responses

### Throughput
- **Basic tier**: 10 req/min
- **Pro tier**: 100 req/min
- **Enterprise tier**: 1000 req/min

### Concurrent Users
- **Sustained**: 100+ users
- **Spike**: 200+ users
- **Soak**: 50 users for 30+ minutes

## Interpreting Results

### Artillery Output
```
Summary report @ HH:MM:SS
  Scenarios launched:  10000
  Scenarios completed: 9950
  Requests completed:  29850
  Mean response/sec:   50
  Response time (msec):
    min: 45
    max: 892
    median: 123
    p95: 456
    p99: 678
  Codes:
    200: 28000
    201: 1200
    429: 650
```

### K6 Output
```
✓ status is 200 or 401
✓ response time < 500ms

checks.........................: 95.23% ✓ 9523 ✗ 477
data_received..................: 15 MB  250 kB/s
data_sent......................: 2.5 MB 42 kB/s
http_req_duration..............: avg=234ms min=45ms med=198ms max=2.1s p(95)=456ms p(99)=789ms
http_reqs......................: 10000  166/s
successful_requests............: 9523
rate_limit_hits................: 650
```

## Troubleshooting

### High Error Rates
- Check server logs for errors
- Verify database connection pool size
- Monitor CPU/memory usage
- Review rate limit settings

### Slow Response Times
- Enable database query logging
- Check for N+1 queries
- Review index usage
- Monitor external API calls

### Rate Limit Issues
- Verify tier limits in configuration
- Check token bucket algorithm
- Review cleanup intervals
- Monitor Redis/Firestore performance

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Load Tests
  run: |
    npm install -g k6
    cd tests/load
    k6 run --quiet k6-load-test.js
```

### Performance Regression Detection
```bash
# Compare current vs baseline
k6 run --out json=results.json k6-load-test.js
k6 inspect results.json --threshold "http_req_duration<500"
```

## Monitoring During Tests

### System Metrics
- CPU usage
- Memory usage
- Database connections
- Network I/O

### Application Metrics
- Request rate
- Error rate
- Response times
- Active connections

### Tools
- Artillery Cloud (real-time monitoring)
- k6 Cloud (advanced analytics)
- DataDog/New Relic integration
- Grafana dashboards

## Best Practices

1. **Start small**: Begin with 10-20 users
2. **Ramp gradually**: Allow system to stabilize
3. **Monitor everything**: Watch metrics during tests
4. **Test in stages**: Isolate different load patterns
5. **Use realistic data**: Match production patterns
6. **Clean up**: Reset test data between runs
7. **Document baselines**: Track performance over time
8. **Test regularly**: Include in CI/CD pipeline
