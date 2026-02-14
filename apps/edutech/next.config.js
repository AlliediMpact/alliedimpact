/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Internationalization
  i18n: {
    locales: ['en', 'zu', 'xh'],
    defaultLocale: 'en',
  },
  
  // Image optimization
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com', // Google profile images
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'EduTech',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007',
  },
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss: https://firebasestorage.googleapis.com https://www.google-analytics.com",
              "media-src 'self' https:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  // Webpack configuration
  webpack: (config) => {
    // Add any custom webpack config here
    return config;
  },
  
  // Experimental features
  experimental: {
    // Enable when needed
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
    ];
  },
};

// Wrap with Sentry for error monitoring
// const { withSentryConfig } = require('@sentry/nextjs');

// module.exports = withSentryConfig(
//   nextConfig,
//   {
//     // Sentry Webpack Plugin Options
//     silent: true,
//     org: process.env.SENTRY_ORG,
//     project: process.env.SENTRY_PROJECT,
//   },
//   {
//     // Upload source maps in production only
//     widenClientFileUpload: true,
//     transpileClientSDK: true,
//     tunnelRoute: '/monitoring',
//     hideSourceMaps: true,
//     disableLogger: true,
//   }
// );

module.exports = nextConfig;
