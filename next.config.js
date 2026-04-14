/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:4001';
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiTarget}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig