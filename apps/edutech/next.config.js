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

module.exports = nextConfig;
