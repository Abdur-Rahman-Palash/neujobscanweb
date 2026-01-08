/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'vercel.app',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  turbopack: {},
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  // Security
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: '/auth/signin',
        permanent: false,
        has: [
          {
            type: 'header',
            key: 'authorization',
            value: undefined,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
