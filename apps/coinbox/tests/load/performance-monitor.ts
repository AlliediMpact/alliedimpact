/**
 * Performance Monitoring Script
 * Monitors system metrics during load tests
 */

import os from 'os';
import fs from 'fs';
import { performance } from 'perf_hooks';

interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    loadAvg: number[];
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  process: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    uptime: number;
  };
}

class PerformanceMonitor {
  private metrics: SystemMetrics[] = [];
  private interval: NodeJS.Timeout | null = null;
  private startTime: number = 0;

  start(intervalMs: number = 5000) {
    this.startTime = performance.now();
    console.log('📊 Performance monitoring started');
    
    this.interval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);
    
    // Collect initial metrics
    this.collectMetrics();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    const duration = (performance.now() - this.startTime) / 1000;
    console.log(`📊 Performance monitoring stopped after ${duration.toFixed(2)}s`);
    
    return this.generateReport();
  }

  private collectMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const memUsage = process.memoryUsage();
    
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: this.getCpuUsage(),
        loadAvg: os.loadavg(),
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usagePercent: (usedMem / totalMem) * 100,
      },
      process: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
        uptime: process.uptime(),
      },
    };
    
    this.metrics.push(metrics);
    
    // Log warning if memory usage is high
    if (metrics.memory.usagePercent > 90) {
      console.warn(`⚠️  High memory usage: ${metrics.memory.usagePercent.toFixed(2)}%`);
    }
  }

  private getCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle) / total;
    
    return usage;
  }

  private generateReport() {
    if (this.metrics.length === 0) {
      return {
        error: 'No metrics collected',
      };
    }
    
    // Calculate statistics
    const memUsages = this.metrics.map(m => m.memory.usagePercent);
    const cpuUsages = this.metrics.map(m => m.cpu.usage);
    const heapUsed = this.metrics.map(m => m.process.heapUsed);
    
    const report = {
      summary: {
        duration: (performance.now() - this.startTime) / 1000,
        samples: this.metrics.length,
        startTime: this.metrics[0].timestamp,
        endTime: this.metrics[this.metrics.length - 1].timestamp,
      },
      memory: {
        min: Math.min(...memUsages).toFixed(2) + '%',
        max: Math.max(...memUsages).toFixed(2) + '%',
        avg: (memUsages.reduce((a, b) => a + b, 0) / memUsages.length).toFixed(2) + '%',
        peak: Math.max(...heapUsed),
      },
      cpu: {
        min: Math.min(...cpuUsages).toFixed(2) + '%',
        max: Math.max(...cpuUsages).toFixed(2) + '%',
        avg: (cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length).toFixed(2) + '%',
        loadAvg: os.loadavg(),
      },
      warnings: this.getWarnings(),
      rawData: this.metrics,
    };
    
    return report;
  }

  private getWarnings(): string[] {
    const warnings: string[] = [];
    
    const memUsages = this.metrics.map(m => m.memory.usagePercent);
    const maxMem = Math.max(...memUsages);
    
    if (maxMem > 90) {
      warnings.push(`Critical memory usage detected: ${maxMem.toFixed(2)}%`);
    } else if (maxMem > 80) {
      warnings.push(`High memory usage detected: ${maxMem.toFixed(2)}%`);
    }
    
    const cpuUsages = this.metrics.map(m => m.cpu.usage);
    const maxCpu = Math.max(...cpuUsages);
    
    if (maxCpu > 90) {
      warnings.push(`Critical CPU usage detected: ${maxCpu.toFixed(2)}%`);
    } else if (maxCpu > 80) {
      warnings.push(`High CPU usage detected: ${maxCpu.toFixed(2)}%`);
    }
    
    // Check for memory leaks (heap growing consistently)
    if (this.metrics.length > 5) {
      const recentHeap = this.metrics.slice(-5).map(m => m.process.heapUsed);
      const isGrowing = recentHeap.every((val, i, arr) => i === 0 || val > arr[i - 1]);
      
      if (isGrowing) {
        warnings.push('Potential memory leak detected: heap size consistently growing');
      }
    }
    
    return warnings;
  }

  saveReport(filename: string = 'performance-report.json') {
    const report = this.generateReport();
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to ${filename}`);
    return report;
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  
  monitor.start(1000); // Collect every second
  
  // Stop after 60 seconds or on SIGINT
  const timeout = setTimeout(() => {
    const report = monitor.stop();
    console.log('\n📊 Performance Report:');
    console.log('Duration:', report.summary.duration.toFixed(2) + 's');
    console.log('Memory Usage:', report.memory.avg, '(peak:', report.memory.max + ')');
    console.log('CPU Usage:', report.cpu.avg, '(peak:', report.cpu.max + ')');
    
    if (report.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      report.warnings.forEach(w => console.log('  -', w));
    }
    
    monitor.saveReport();
    process.exit(0);
  }, 60000);
  
  process.on('SIGINT', () => {
    clearTimeout(timeout);
    const report = monitor.stop();
    monitor.saveReport();
    console.log('\n✅ Monitoring stopped');
    process.exit(0);
  });
}

export default PerformanceMonitor;
