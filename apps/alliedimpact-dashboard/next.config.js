/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@allied-impact/auth',
    '@allied-impact/entitlements',
    '@allied-impact/billing',
    '@allied-impact/types',
    '@allied-impact/ui',
    '@allied-impact/utils',
  ],
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  env: {
    NEXT_PUBLIC_HOMEPAGE_URL: process.env.NEXT_PUBLIC_HOMEPAGE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
