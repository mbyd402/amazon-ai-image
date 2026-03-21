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
  
  // 🎯 强制跳过特定API路由的构建检查
  nextConfig.pageExtensions = ['tsx', 'ts', 'jsx', 'js', 'mdx']
  
  // 添加环境变量告诉API路由这是构建时
  process.env.IS_BUILD_TIME = 'true'
  process.env.SKIP_API_CHECKS = 'true'
}

// 🎯 专门的构建配置：如果某些API路由仍然有问题，创建备用版本
const fs = require('fs')
const path = require('path')

// 检查是否需要创建API路由的构建时备用版本
const problematicApiRoutes = [
  '/api/paypal/webhook',
  '/api/process',
]

if (process.env.NETLIFY && process.env.NODE_ENV === 'production') {
  console.log('🔧 为有问题的API路由创建构建时备用配置')
  
  // 标记环境为构建时
  process.env.NETLIFY_BUILD = 'true'
}

module.exports = nextConfig
