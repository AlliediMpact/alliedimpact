#!/usr/bin/env node

/**
 * Load Test Results Analyzer
 * Analyzes and compares load test results
 */

const fs = require('fs');
const path = require('path');

class LoadTestAnalyzer {
  constructor() {
    this.thresholds = {
      responseTime: {
        p50: 200,
        p95: 500,
        p99: 1000,
      },
      errorRate: 0.01, // 1%
      throughput: {
        min: 50, // requests per second
      },
    };
  }

  analyzeArtilleryResults(filePath) {
    console.log('\n🎯 Analyzing Artillery Results...\n');
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const aggregate = data.aggregate;
    
    const results = {
      summary: {
        scenariosLaunched: aggregate.scenariosCreated || 0,
        scenariosCompleted: aggregate.scenariosCompleted || 0,
        requestsCompleted: aggregate.requestsCompleted || 0,
        duration: (data.aggregate.firstMetricAt && data.aggregate.lastMetricAt)
          ? (new Date(data.aggregate.lastMetricAt) - new Date(data.aggregate.firstMetricAt)) / 1000
          : 0,
      },
      performance: {
        responseTime: {
          min: aggregate.latency?.min || 0,
          max: aggregate.latency?.max || 0,
          median: aggregate.latency?.median || 0,
          p95: aggregate.latency?.p95 || 0,
          p99: aggregate.latency?.p99 || 0,
        },
        rps: aggregate.rps?.mean || 0,
      },
      errors: {
        total: aggregate.errors || 0,
        rate: aggregate.errors / (aggregate.requestsCompleted || 1),
        codes: aggregate.codes || {},
      },
    };
    
    // Evaluate against thresholds
    const evaluation = this.evaluateResults(results);
    
    this.printResults(results, evaluation);
    
    return { results, evaluation };
  }

  analyzeK6Results(filePath) {
    console.log('\n🎯 Analyzing K6 Results...\n');
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const metrics = data.metrics;
    
    const results = {
      summary: {
        vus: metrics.vus?.value || 0,
        iterations: metrics.iterations?.count || 0,
        duration: data.state?.testRunDurationMs / 1000 || 0,
      },
      performance: {
        responseTime: {
          min: metrics.http_req_duration?.min || 0,
          max: metrics.http_req_duration?.max || 0,
          avg: metrics.http_req_duration?.avg || 0,
          median: metrics.http_req_duration?.med || 0,
          p90: metrics.http_req_duration?.['p(90)'] || 0,
          p95: metrics.http_req_duration?.['p(95)'] || 0,
          p99: metrics.http_req_duration?.['p(99)'] || 0,
        },
        throughput: {
          rps: metrics.http_reqs?.rate || 0,
          dataReceived: metrics.data_received?.count || 0,
          dataSent: metrics.data_sent?.count || 0,
        },
      },
      errors: {
        failed: metrics.http_req_failed?.rate || 0,
        checkFailures: (1 - (metrics.checks?.rate || 1)),
      },
      custom: {
        successfulRequests: metrics.successful_requests?.count || 0,
        rateLimitHits: metrics.rate_limit_hits?.count || 0,
      },
    };
    
    const evaluation = this.evaluateResults(results);
    
    this.printResults(results, evaluation);
    
    return { results, evaluation };
  }

  evaluateResults(results) {
    const evaluation = {
      passed: true,
      failures: [],
      warnings: [],
      score: 100,
    };
    
    // Check response times
    if (results.performance.responseTime) {
      const rt = results.performance.responseTime;
      
      if (rt.p95 > this.thresholds.responseTime.p95) {
        evaluation.failures.push(
          `P95 response time (${rt.p95.toFixed(0)}ms) exceeds threshold (${this.thresholds.responseTime.p95}ms)`
        );
        evaluation.score -= 20;
        evaluation.passed = false;
      } else if (rt.p95 > this.thresholds.responseTime.p95 * 0.9) {
        evaluation.warnings.push(
          `P95 response time (${rt.p95.toFixed(0)}ms) is close to threshold`
        );
        evaluation.score -= 5;
      }
      
      if (rt.p99 > this.thresholds.responseTime.p99) {
        evaluation.failures.push(
          `P99 response time (${rt.p99.toFixed(0)}ms) exceeds threshold (${this.thresholds.responseTime.p99}ms)`
        );
        evaluation.score -= 15;
        evaluation.passed = false;
      }
      
      if (rt.median > this.thresholds.responseTime.p50) {
        evaluation.warnings.push(
          `Median response time (${rt.median.toFixed(0)}ms) exceeds target (${this.thresholds.responseTime.p50}ms)`
        );
        evaluation.score -= 10;
      }
    }
    
    // Check error rates
    if (results.errors) {
      const errorRate = results.errors.rate || results.errors.failed || 0;
      
      if (errorRate > this.thresholds.errorRate) {
        evaluation.failures.push(
          `Error rate (${(errorRate * 100).toFixed(2)}%) exceeds threshold (${this.thresholds.errorRate * 100}%)`
        );
        evaluation.score -= 30;
        evaluation.passed = false;
      } else if (errorRate > this.thresholds.errorRate * 0.5) {
        evaluation.warnings.push(
          `Error rate (${(errorRate * 100).toFixed(2)}%) is elevated`
        );
        evaluation.score -= 10;
      }
    }
    
    // Check throughput
    if (results.performance.rps || results.performance.throughput?.rps) {
      const rps = results.performance.rps || results.performance.throughput.rps;
      
      if (rps < this.thresholds.throughput.min) {
        evaluation.warnings.push(
          `Throughput (${rps.toFixed(2)} req/s) is below target (${this.thresholds.throughput.min} req/s)`
        );
        evaluation.score -= 15;
      }
    }
    
    return evaluation;
  }

  printResults(results, evaluation) {
    console.log('📊 Test Summary');
    console.log('═'.repeat(50));
    
    if (results.summary) {
      console.log('\n📈 Overview:');
      Object.entries(results.summary).forEach(([key, value]) => {
        const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
        console.log(`  ${key}: ${formattedValue}`);
      });
    }
    
    if (results.performance.responseTime) {
      console.log('\n⏱️  Response Times (ms):');
      const rt = results.performance.responseTime;
      console.log(`  Min:    ${rt.min?.toFixed(0) || 'N/A'}`);
      console.log(`  Median: ${rt.median?.toFixed(0) || 'N/A'}`);
      console.log(`  P95:    ${rt.p95?.toFixed(0) || 'N/A'} ${rt.p95 > this.thresholds.responseTime.p95 ? '❌' : '✅'}`);
      console.log(`  P99:    ${rt.p99?.toFixed(0) || 'N/A'} ${rt.p99 > this.thresholds.responseTime.p99 ? '❌' : '✅'}`);
      console.log(`  Max:    ${rt.max?.toFixed(0) || 'N/A'}`);
    }
    
    if (results.errors) {
      console.log('\n❗ Errors:');
      const errorRate = results.errors.rate || results.errors.failed || 0;
      const errorPct = (errorRate * 100).toFixed(2);
      console.log(`  Rate: ${errorPct}% ${errorRate > this.thresholds.errorRate ? '❌' : '✅'}`);
      
      if (results.errors.codes) {
        console.log('  Status Codes:');
        Object.entries(results.errors.codes).forEach(([code, count]) => {
          console.log(`    ${code}: ${count}`);
        });
      }
    }
    
    console.log('\n🎯 Evaluation');
    console.log('═'.repeat(50));
    console.log(`Overall Score: ${evaluation.score}/100`);
    console.log(`Status: ${evaluation.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (evaluation.failures.length > 0) {
      console.log('\n❌ Failures:');
      evaluation.failures.forEach(f => console.log(`  - ${f}`));
    }
    
    if (evaluation.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      evaluation.warnings.forEach(w => console.log(`  - ${w}`));
    }
    
    if (evaluation.passed && evaluation.warnings.length === 0) {
      console.log('\n✨ All tests passed with no warnings!');
    }
    
    console.log('\n');
  }

  compareResults(file1, file2) {
    console.log('\n📊 Comparing Test Results...\n');
    
    const results1 = this.analyzeArtilleryResults(file1);
    const results2 = this.analyzeArtilleryResults(file2);
    
    if (!results1 || !results2) {
      console.error('❌ Could not load both result files');
      return;
    }
    
    console.log('\n📈 Performance Comparison');
    console.log('═'.repeat(50));
    
    const diff = {
      responseTime: {
        p95: results2.results.performance.responseTime.p95 - results1.results.performance.responseTime.p95,
        p99: results2.results.performance.responseTime.p99 - results1.results.performance.responseTime.p99,
      },
      errorRate: results2.results.errors.rate - results1.results.errors.rate,
      throughput: results2.results.performance.rps - results1.results.performance.rps,
    };
    
    console.log('\nP95 Response Time:');
    console.log(`  Before: ${results1.results.performance.responseTime.p95.toFixed(0)}ms`);
    console.log(`  After:  ${results2.results.performance.responseTime.p95.toFixed(0)}ms`);
    console.log(`  Change: ${diff.responseTime.p95 > 0 ? '+' : ''}${diff.responseTime.p95.toFixed(0)}ms ${diff.responseTime.p95 > 0 ? '📈' : '📉'}`);
    
    console.log('\nError Rate:');
    console.log(`  Before: ${(results1.results.errors.rate * 100).toFixed(2)}%`);
    console.log(`  After:  ${(results2.results.errors.rate * 100).toFixed(2)}%`);
    console.log(`  Change: ${diff.errorRate > 0 ? '+' : ''}${(diff.errorRate * 100).toFixed(2)}% ${diff.errorRate > 0 ? '📈' : '📉'}`);
    
    console.log('\nThroughput:');
    console.log(`  Before: ${results1.results.performance.rps.toFixed(2)} req/s`);
    console.log(`  After:  ${results2.results.performance.rps.toFixed(2)} req/s`);
    console.log(`  Change: ${diff.throughput > 0 ? '+' : ''}${diff.throughput.toFixed(2)} req/s ${diff.throughput > 0 ? '📈' : '📉'}`);
    
    console.log('\n');
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const analyzer = new LoadTestAnalyzer();
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node analyze-results.js <artillery-report.json>');
    console.log('  node analyze-results.js <k6-results.json> --k6');
    console.log('  node analyze-results.js <report1.json> <report2.json> --compare');
    process.exit(1);
  }
  
  if (args.includes('--compare')) {
    analyzer.compareResults(args[0], args[1]);
  } else if (args.includes('--k6')) {
    analyzer.analyzeK6Results(args[0]);
  } else {
    analyzer.analyzeArtilleryResults(args[0]);
  }
}

module.exports = LoadTestAnalyzer;
