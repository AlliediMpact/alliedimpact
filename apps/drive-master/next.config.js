/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'DriveMaster',
    NEXT_PUBLIC_PRODUCT_ID: 'drive-master',
  },

  // Image optimization
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com', // Google profile pictures
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },

  // Compression
  compress: true,

  // PWA support
  ...(process.env.NEXT_PUBLIC_ENABLE_PWA === 'true' && {
    // Will be configured with next-pwa plugin
  }),

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Production-only optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
