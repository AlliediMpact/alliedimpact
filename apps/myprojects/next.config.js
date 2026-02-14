/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@allied-impact/auth',
    '@allied-impact/entitlements',
    '@allied-impact/projects',
    '@allied-impact/ui',
    '@allied-impact/shared',
    '@allied-impact/types',
  ],
  env: {
    NEXT_PUBLIC_APP_NAME: 'My Projects',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_MYPROJECTS_URL || 'http://localhost:3006',
    NEXT_PUBLIC_PLATFORM_URL: process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3001',
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
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
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://firebasestorage.googleapis.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss: https://firebasestorage.googleapis.com",
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
};

module.exports = nextConfig;
