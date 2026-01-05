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
};

module.exports = nextConfig;
