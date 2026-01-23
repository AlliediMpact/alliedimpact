/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Transpile workspace packages
  transpilePackages: [
    '@allied-impact/auth',
    '@allied-impact/types',
    '@allied-impact/ui',
  ],

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'ControlHub',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
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
        ],
      },
    ];
  },
};

module.exports = nextConfig;
