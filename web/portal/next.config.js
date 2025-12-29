/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  experimental: {
    optimizePackageImports: ['@allied-impact/ui'],
  },
};

module.exports = nextConfig;
