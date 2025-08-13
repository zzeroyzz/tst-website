// next.config.js (TypeScript OK)
import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Enable CSS optimization
  experimental: {
    optimizeCss: true, // Removes unused CSS
  },
  // Enable SWC minification for better performance
  swcMinify: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: `${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`,
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Add image optimization
    formats: ['image/webp', 'image/avif'],
  },
  async redirects() {
    return [
      {
        source: '/toasty-tidbits-archive', // old path
        destination: '/mental-health-healing-blog', // new path
        permanent: true, // 301 redirect
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
