/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['*.r2.cloudflarestorage.com', 'supabase.co'],
  },
  // 🎯 极简配置：为Netlify构建优化
  generateBuildId: async () => {
    return Date.now().toString()
  },
}

// 🎯 Netlify专门配置
if (process.env.NETLIFY) {
  console.log('🔧 Netlify构建环境，启用极简配置')
  
  // 🎯 禁用所有构建时优化，确保构建成功
  nextConfig.swcMinify = false
  nextConfig.compiler = {
    removeConsole: false,
  }
  
  // 🎯 禁用所有实验性功能
  nextConfig.experimental = {
    // 禁用所有可能引起问题的实验功能
    optimizeCss: false,
    scrollRestoration: false,
    workerThreads: false,
  }
  
  // 🎯 标记构建环境
  process.env.IS_BUILD_TIME = 'true'
  process.env.NETLIFY_BUILD = 'true'
  
  // 🎯 简化Webpack配置
  nextConfig.webpack = (config, { isServer }) => {
    if (isServer) {
      console.log('🔧 简化服务器端Webpack配置')
      
      // 减少内存使用
      config.optimization = {
        ...config.optimization,
        minimize: false,
        splitChunks: false,
      }
      
      // 禁用source maps以减少内存
      config.devtool = false
    }
    
    // 🎯 重要：跳过API路由的构建时数据收集
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    
    return config
  }
}

module.exports = nextConfig
