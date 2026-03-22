/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['*.r2.cloudflarestorage.com', 'supabase.co'],
  },
  // 构建ID
  generateBuildId: async () => {
    return Date.now().toString()
  },
}

// Netlify环境优化
if (process.env.NETLIFY) {
  console.log('🔧 Netlify构建环境，启用优化配置')
  
  // 标记构建环境
  process.env.IS_BUILD_TIME = 'true'
  process.env.NETLIFY_BUILD = 'true'
  
  // 基础优化
  nextConfig.swcMinify = true  // 启用SWC压缩（比Terser更快）
  
  // 移除控制台输出
  nextConfig.compiler = {
    removeConsole: process.env.NODE_ENV === 'production',
  }
  
  // 简化Webpack配置（保持路径别名）
  nextConfig.webpack = (config, { isServer }) => {
    // 确保路径别名被正确解析
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname),
      }
    }
    
    // 保持原有配置，只添加必要的优化
    if (isServer) {
      // 服务器端优化
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
        },
      }
    }
    
    return config
  }
}

module.exports = nextConfig