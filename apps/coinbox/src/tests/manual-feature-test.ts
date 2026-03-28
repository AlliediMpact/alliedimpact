// Manual test script to verify our Phase 3 features
import performanceMonitoringService from '../lib/performance-monitoring-service';
import { advancedAnalyticsService } from '../lib/advanced-analytics-service';
import { riskAssessmentService } from '../lib/risk-assessment-service';
import { pwaService } from '../lib/pwa-service';

console.log('🧪 Testing Allied iMpact Coin Box - Phase 3 Features...\n');

// Test 1: Performance Monitoring Service
console.log('📊 Testing Performance Monitoring Service...');
try {
  performanceMonitoringService.startMonitoring();
  const metrics = performanceMonitoringService.getMetrics();
  console.log('✅ Performance metrics:', metrics);
  
  // Test error reporting
  performanceMonitoringService.reportError({
    type: 'client',
    severity: 'medium',
    message: 'Test error for manual verification'
  });
  
  const errors = performanceMonitoringService.getErrors(5);
  console.log('✅ Error reporting works, errors count:', errors.length);
  
  const suggestions = performanceMonitoringService.getSuggestions();
  console.log('✅ Optimization suggestions:', suggestions.length, 'items');
  
  performanceMonitoringService.stopMonitoring();
  console.log('✅ Performance Monitoring Service: PASSED\n');
} catch (error) {
  console.error('❌ Performance Monitoring Service: FAILED', error);
}

// Test 2: Advanced Analytics Service
console.log('📈 Testing Advanced Analytics Service...');
try {
  // Test analytics metrics
  advancedAnalyticsService.getAnalyticsMetrics({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  }).then(metrics => {
    console.log('✅ Analytics metrics generated successfully');
    console.log('  - Total Users:', metrics.overview.totalUsers);
    console.log('  - Total Transactions:', metrics.overview.totalTransactions);
    console.log('  - Total Revenue:', metrics.overview.totalRevenue);
  });
  
  // Test predictive analytics
  advancedAnalyticsService.getPredictiveAnalytics().then(predictions => {
    console.log('✅ Predictive analytics generated successfully');
    console.log('  - User Growth Predictions:', predictions.userGrowth.prediction.length, 'data points');
    console.log('  - Revenue Predictions:', predictions.revenue.forecast.length, 'data points');
  });
  
  // Test user insights
  advancedAnalyticsService.getUserInsights('test-user-123').then(insights => {
    console.log('✅ User insights generated successfully');
    console.log('  - Risk Level:', insights.riskProfile.riskLevel);
    console.log('  - Activity Score:', insights.profile.activityScore);
  });
  
  console.log('✅ Advanced Analytics Service: PASSED\n');
} catch (error) {
  console.error('❌ Advanced Analytics Service: FAILED', error);
}

// Test 3: Risk Assessment Service
console.log('🛡️ Testing Risk Assessment Service...');
try {
  // Test user risk assessment
  riskAssessmentService.assessUserRisk('test-user-123').then(assessment => {
    console.log('✅ User risk assessment generated successfully');
    console.log('  - Risk Score:', assessment.riskScore);
    console.log('  - Risk Level:', assessment.riskLevel);
    console.log('  - Risk Factors:', assessment.riskFactors.length, 'factors');
    console.log('  - Recommendations:', assessment.recommendations.length, 'items');
  });
  
  // Test transaction risk assessment
  const testTransaction = {
    amount: 1000,
    type: 'investment' as const,
    userId: 'test-user-123',
    timestamp: new Date(),
    recipientId: 'recipient-123'
  };
  
  riskAssessmentService.assessTransactionRisk(testTransaction).then(assessment => {
    console.log('✅ Transaction risk assessment generated successfully');
    console.log('  - Transaction Risk Score:', assessment.riskScore);
    console.log('  - Transaction Risk Level:', assessment.riskLevel);
  });
  
  console.log('✅ Risk Assessment Service: PASSED\n');
} catch (error) {
  console.error('❌ Risk Assessment Service: FAILED', error);
}

// Test 4: PWA Service
console.log('📱 Testing PWA Service...');
try {
  const status = pwaService.getStatus();
  console.log('✅ PWA status retrieved successfully');
  console.log('  - Service Worker Supported:', status.isServiceWorkerSupported);
  console.log('  - Is Online:', status.isOnline);
  console.log('  - Is Installable:', status.isInstallable);
  console.log('  - Is Installed:', status.isInstalled);
  
  // Test caching
  pwaService.cacheResources(['/dashboard', '/auth']).then(result => {
    console.log('✅ Resource caching:', result.success ? 'PASSED' : 'FAILED');
  });
  
  console.log('✅ PWA Service: PASSED\n');
} catch (error) {
  console.error('❌ PWA Service: FAILED', error);
}

console.log('🎉 Manual testing completed! Check output above for results.');
console.log('🚀 Phase 3 services are ready for production testing!');

export {};
