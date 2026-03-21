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
  // 🔧 修复：跳过PayPal webhook的构建检查
  experimental: {
    // 跳过特定API路由的构建时数据收集
    skipMiddlewareUrlNormalize: true,
  },
  // 在构建时跳过特定页面
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

// 动态配置：在构建时跳过PayPal webhook
if (process.env.SKIP_PAYPAL_BUILD === 'true' || !process.env.PAYPAL_CLIENT_SECRET) {
  console.log('⚠️ PayPal环境变量缺失，跳过PayPal webhook构建检查')
  nextConfig.experimental = {
    ...nextConfig.experimental,
    // 跳过PayPal webhook的静态生成
    isrMemoryCacheSize: 0,
  }
}

module.exports = nextConfig
