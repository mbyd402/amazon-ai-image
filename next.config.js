/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['*.r2.cloudflarestorage.com', 'supabase.co'],
  },
  // 构建优化
  swcMinify: true,
  // 明确声明环境变量，确保在构建时可用
  env: {
    // 这些变量会在构建时替换
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  // 禁用服务器端组件缓存（可能影响环境变量）
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // 静态页面生成时避免环境变量问题
  output: 'standalone',
  // 优化构建过程
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
}

module.exports = nextConfig