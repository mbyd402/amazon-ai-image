/** @type {import('next').NextConfig} */

// 打印环境变量信息用于调试
console.log('=== next.config.js 构建时环境变量检查 ===')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? `长度: ${process.env.NEXT_PUBLIC_SUPABASE_URL.length}` : 'UNDEFINED')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `长度: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length}` : 'UNDEFINED')
console.log('NEXT_PUBLIC_PAYPAL_CLIENT_ID:', process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? `长度: ${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID.length}` : 'UNDEFINED')

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['*.r2.cloudflarestorage.com', 'supabase.co'],
  },
  // 构建优化
  swcMinify: true,
  // 明确声明环境变量，确保在构建时可用
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || '',
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