/**
 * Environment Configuration
 * Centralized environment variables with validation
 */

interface EnvironmentConfig {
  // App
  NODE_ENV: string;
  NEXT_PUBLIC_APP_URL: string;
  
  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  NEXT_PUBLIC_FIREBASE_APP_ID: string;
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
  
  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
  
  // Features
  NEXT_PUBLIC_ENABLE_ANALYTICS: boolean;
  NEXT_PUBLIC_ENABLE_PWA: boolean;
  NEXT_PUBLIC_ENABLE_ACCESSIBILITY_MONITOR: boolean;
  
  // API
  NEXT_PUBLIC_API_URL?: string;
  
  // Redis (Server-side only)
  REDIS_URL?: string;
  REDIS_TOKEN?: string;
}

function getEnvVar(key: string, required: boolean = false, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || '';
}

function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

export const env: EnvironmentConfig = {
  // App
  NODE_ENV: getEnvVar('NODE_ENV', true, 'development'),
  NEXT_PUBLIC_APP_URL: getEnvVar('NEXT_PUBLIC_APP_URL', false, 'http://localhost:3005'),
  
  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY', true),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', true),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID', true),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', true),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', true),
  NEXT_PUBLIC_FIREBASE_APP_ID: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID', true),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: getEnvVar('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'),
  
  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: getEnvVar('NEXT_PUBLIC_GA_MEASUREMENT_ID'),
  
  // Features
  NEXT_PUBLIC_ENABLE_ANALYTICS: getBooleanEnv('NEXT_PUBLIC_ENABLE_ANALYTICS', true),
  NEXT_PUBLIC_ENABLE_PWA: getBooleanEnv('NEXT_PUBLIC_ENABLE_PWA', true),
  NEXT_PUBLIC_ENABLE_ACCESSIBILITY_MONITOR: getBooleanEnv('NEXT_PUBLIC_ENABLE_ACCESSIBILITY_MONITOR', false),
  
  // API
  NEXT_PUBLIC_API_URL: getEnvVar('NEXT_PUBLIC_API_URL'),
  
  // Redis
  REDIS_URL: getEnvVar('REDIS_URL'),
  REDIS_TOKEN: getEnvVar('REDIS_TOKEN'),
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Validate configuration on load (only in Node.js environment)
if (typeof window === 'undefined') {
  console.log('✅ Environment configuration loaded');
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   App URL: ${env.NEXT_PUBLIC_APP_URL}`);
  console.log(`   Firebase Project: ${env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
  console.log(`   Analytics: ${env.NEXT_PUBLIC_ENABLE_ANALYTICS ? 'Enabled' : 'Disabled'}`);
  console.log(`   PWA: ${env.NEXT_PUBLIC_ENABLE_PWA ? 'Enabled' : 'Disabled'}`);
}
