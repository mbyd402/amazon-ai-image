/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['*.r2.cloudflarestorage.com', 'supabase.co'],
  },
  // 构建ID
  generateBuildId: async () => {
    return Date.now().toString()
  },
  // 确保环境变量在客户端可访问
  env: {
    // 这里可以硬编码环境变量作为后备方案
    // 但更好的做法是在 Vercel 中配置
  },
  // 编译器优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Webpack配置 - 确保环境变量处理
  webpack: (config, { isServer, webpack }) => {
    // 确保路径别名被正确解析
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname),
      }
    }
    
    // 确保环境变量在客户端可用
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
        'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
      })
    )
    
    return config
  }
}

module.exports = nextConfig