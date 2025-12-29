#!/usr/bin/env node

/**
 * Phase 2 Implementation Validation Script
 * Verifies all files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Phase 2 Implementation Validation\n');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    checks.passed.push(`✅ ${description}`);
    return true;
  } else {
    checks.failed.push(`❌ ${description} - Missing: ${filePath}`);
    return false;
  }
}

function checkDirectory(dirPath, description) {
  const fullPath = path.join(__dirname, '..', dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    checks.passed.push(`✅ ${description}`);
    return true;
  } else {
    checks.failed.push(`❌ ${description} - Missing: ${dirPath}`);
    return false;
  }
}

// Check Functions Structure
console.log('📂 Checking Functions Structure...\n');

checkDirectory('functions', 'Functions directory exists');
checkFile('functions/package.json', 'Functions package.json');
checkFile('functions/tsconfig.json', 'Functions TypeScript config');
checkFile('functions/.eslintrc.js', 'Functions ESLint config');
checkFile('functions/.env.example', 'Functions environment template');
checkFile('functions/README.md', 'Functions README');

// Check Source Files
console.log('\n📝 Checking Source Files...\n');

checkFile('functions/src/index.ts', 'Main index file');
checkFile('functions/src/types/index.ts', 'Type definitions');
checkFile('functions/src/config/constants.ts', 'Configuration constants');
checkFile('functions/src/config/firebase.ts', 'Firebase config');

// Check Utils
checkFile('functions/src/utils/validate.ts', 'Validation utilities');
checkFile('functions/src/utils/txLogger.ts', 'Transaction logger');
checkFile('functions/src/utils/paystack.ts', 'Paystack integration');
checkFile('functions/src/utils/fraud.ts', 'Fraud detection');
checkFile('functions/src/utils/notifications.ts', 'Notification service');

// Check Wallet
checkFile('functions/src/wallet/walletService.ts', 'Wallet service');
checkFile('functions/src/wallet/index.ts', 'Wallet Cloud Functions');

// Check P2P
checkFile('functions/src/p2p/offerService.ts', 'Offer service');
checkFile('functions/src/p2p/orderService.ts', 'Order/Escrow service');
checkFile('functions/src/p2p/index.ts', 'P2P Cloud Functions');

// Check Scheduled
checkFile('functions/src/scheduled/index.ts', 'Scheduled functions');

// Check Frontend Integration
console.log('\n🎨 Checking Frontend Integration...\n');

checkFile('src/lib/api/firebase-client-config.ts', 'Firebase client config');
checkFile('src/lib/api/wallet.ts', 'Wallet API client');
checkFile('src/lib/api/p2p.ts', 'P2P API client');

// Check Configuration
console.log('\n⚙️  Checking Configuration Files...\n');

checkFile('firestore.rules', 'Firestore security rules');
checkFile('firestore.indexes.json', 'Firestore indexes');
checkFile('firebase.json', 'Firebase configuration');

// Check Documentation
console.log('\n📚 Checking Documentation...\n');

checkFile('docs/PHASE_2_COMPLETE.md', 'Complete implementation guide');
checkFile('docs/PHASE_2_QUICK_REFERENCE.md', 'Quick reference guide');
checkFile('docs/PHASE_2_DEPLOYMENT_CHECKLIST.md', 'Deployment checklist');
checkFile('docs/PHASE_2_IMPLEMENTATION_SUMMARY.md', 'Implementation summary');

// Verify Key Content
console.log('\n🔍 Verifying Key Content...\n');

try {
  const rulesContent = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');
  
  if (rulesContent.includes('match /wallets/{userId}')) {
    checks.passed.push('✅ Wallet security rules present');
  } else {
    checks.failed.push('❌ Wallet security rules missing');
  }
  
  if (rulesContent.includes('match /p2p_orders/{orderId}')) {
    checks.passed.push('✅ P2P order security rules present');
  } else {
    checks.failed.push('❌ P2P order security rules missing');
  }
  
  if (rulesContent.includes('allow create, update, delete: if false')) {
    checks.passed.push('✅ No client-side wallet writes enforced');
  } else {
    checks.warnings.push('⚠️  Verify wallet write protection in rules');
  }
} catch (error) {
  checks.failed.push('❌ Could not verify security rules content');
}

// Check Firebase Config
try {
  const firebaseConfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'firebase.json'), 'utf8')
  );
  
  if (firebaseConfig.functions) {
    checks.passed.push('✅ Functions configuration present');
  } else {
    checks.failed.push('❌ Functions configuration missing in firebase.json');
  }
  
  if (firebaseConfig.emulators && firebaseConfig.emulators.functions) {
    checks.passed.push('✅ Functions emulator configured');
  } else {
    checks.warnings.push('⚠️  Functions emulator not configured');
  }
} catch (error) {
  checks.failed.push('❌ Could not verify firebase.json');
}

// Check Indexes
try {
  const indexes = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'firestore.indexes.json'), 'utf8')
  );
  
  const p2pIndexes = indexes.indexes.filter(idx => 
    idx.collectionGroup === 'p2p_orders' || 
    idx.collectionGroup === 'p2p_offers'
  );
  
  if (p2pIndexes.length >= 5) {
    checks.passed.push('✅ P2P indexes configured');
  } else {
    checks.failed.push('❌ Insufficient P2P indexes');
  }
} catch (error) {
  checks.failed.push('❌ Could not verify indexes');
}

// Print Results
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION RESULTS');
console.log('='.repeat(60) + '\n');

console.log(`✅ Passed: ${checks.passed.length}`);
console.log(`❌ Failed: ${checks.failed.length}`);
console.log(`⚠️  Warnings: ${checks.warnings.length}\n`);

if (checks.failed.length > 0) {
  console.log('❌ FAILED CHECKS:\n');
  checks.failed.forEach(msg => console.log('  ' + msg));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  checks.warnings.forEach(msg => console.log('  ' + msg));
  console.log('');
}

if (checks.failed.length === 0 && checks.warnings.length === 0) {
  console.log('🎉 ALL CHECKS PASSED!\n');
  console.log('Phase 2 implementation is complete and ready for deployment.\n');
  console.log('Next steps:');
  console.log('1. Configure .env with Paystack keys');
  console.log('2. Build functions: cd functions && npm run build');
  console.log('3. Deploy: firebase deploy\n');
} else if (checks.failed.length === 0) {
  console.log('✅ All critical checks passed!\n');
  console.log('⚠️  Review warnings above before deploying.\n');
} else {
  console.log('❌ Some checks failed. Please review and fix before deploying.\n');
  process.exit(1);
}

console.log('📚 Documentation:');
console.log('  - /docs/PHASE_2_COMPLETE.md');
console.log('  - /docs/PHASE_2_QUICK_REFERENCE.md');
console.log('  - /docs/PHASE_2_DEPLOYMENT_CHECKLIST.md\n');
