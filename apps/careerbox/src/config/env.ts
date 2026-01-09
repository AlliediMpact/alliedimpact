/**
 * Environment Configuration
 * Type-safe environment variable management with validation
 */

interface EnvironmentConfig {
  // Firebase
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  
  // Analytics (optional)
  analytics?: {
    gaMeasurementId?: string;
  };
  
  // Feature Flags
  features: {
    aiModeration: boolean;
    messaging: boolean;
    locationSharing: boolean;
  };
  
  // API
  api: {
    baseUrl: string;
  };
  
  // Redis (optional)
  redis?: {
    url?: string;
    token?: string;
  };
}

/**
 * Get environment variable with validation
 */
function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || '';
}

/**
 * Parse boolean environment variable
 */
function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  
  if (!value) {
    return defaultValue;
  }
  
  return value === 'true' || value === '1';
}

/**
 * Environment configuration
 */
export const env: EnvironmentConfig = {
  firebase: {
    apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
  },
  
  analytics: {
    gaMeasurementId: getEnvVar('NEXT_PUBLIC_GA_MEASUREMENT_ID', false),
  },
  
  features: {
    aiModeration: getBooleanEnv('NEXT_PUBLIC_ENABLE_AI_MODERATION', true),
    messaging: getBooleanEnv('NEXT_PUBLIC_ENABLE_MESSAGING', true),
    locationSharing: getBooleanEnv('NEXT_PUBLIC_ENABLE_LOCATION_SHARING', true),
  },
  
  api: {
    baseUrl: getEnvVar('NEXT_PUBLIC_API_BASE_URL', false) || 
             (process.env.NODE_ENV === 'production' 
               ? 'https://careerbox.alliedimpact.com/api' 
               : 'http://localhost:3006/api'),
  },
  
  redis: {
    url: getEnvVar('REDIS_URL', false),
    token: getEnvVar('REDIS_TOKEN', false),
  },
};

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// Validate configuration on load
if (typeof window === 'undefined') {
  console.log('✅ CareerBox Environment Configuration Loaded:', {
    environment: process.env.NODE_ENV,
    firebase: {
      projectId: env.firebase.projectId,
    },
    features: env.features,
  });
}
