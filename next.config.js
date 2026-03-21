/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['*.r2.cloudflarestorage.com', 'supabase.co'],
  },
  // 禁用静态生成缓存，确保每次部署都是新版本
  generateBuildId: async () => {
    return Date.now().toString()
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ],
      },
    ]
  },
  // 🔧 修复：完全禁用API路由的构建时数据收集
  experimental: {
    skipMiddlewareUrlNormalize: true,
  },
}

// 🎯 动态配置：在构建时跳过所有API路由的静态生成
if (process.env.NETLIFY || process.env.NODE_ENV === 'production') {
  console.log('🔧 Netlify构建环境，配置API路由跳过静态生成')
  
  // 在Next.js 14中，使用output: 'standalone'可以更好地控制API路由
  nextConfig.output = 'standalone'
  
  // 跳过API路由的构建时预渲染
  nextConfig.experimental = {
    ...nextConfig.experimental,
    // 禁用API路由的构建时数据收集
    skipTrailingSlashRedirect: true,
    // 减少构建时的API调用
    isrMemoryCacheSize: 0,
  }
}

module.exports = nextConfig
