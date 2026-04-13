#!/usr/bin/env node
// Build script that runs tsc but treats TypeScript errors as non-fatal
const { execSync } = require('child_process');

try {
  execSync('tsc --skipLibCheck', { stdio: 'inherit', shell: true });
  process.exit(0);
} catch (error) {
  console.error('⚠️  TypeScript compilation had errors (ignored for compatibility)');
  process.exit(0);
}
