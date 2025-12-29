/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_APP_NAME: 'Drive Master',
    NEXT_PUBLIC_PRODUCT_ID: 'drive-master',
  },
}

module.exports = nextConfig
