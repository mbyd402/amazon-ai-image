/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🎯 最简配置：只为构建成功
  reactStrictMode: false,
  
  // 禁用所有可能引起问题的功能
  swcMinify: false,
  compiler: {
    removeConsole: false,
    emotion: false,
  },
  
  // 🎯 重要：禁用所有实验功能
  experimental: {},
  
  // 输出模式：标准模式，不使用standalone（可能有问题）
  output: undefined,
  
  // 简化图像配置
  images: {
    unoptimized: true,
    domains: [],
  },
  
  // 禁用所有headers和重写
  headers: async () => [],
  rewrites: async () => [],
  redirects: async () => [],
  
  // 禁用trailing slash处理
  trailingSlash: false,
  
  // Webpack配置：最小化
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 简化服务器端构建
      config.optimization = {
        minimize: false,
      }
      
      // 禁用source maps
      config.devtool = false
    }
    
    return config
  },
}

// 🎯 Netlify环境：极简配置
if (process.env.NETLIFY) {
  console.log('🔧 Netlify极简构建模式')
  
  // 标记构建环境
  process.env.IS_BUILD_TIME = 'true'
  process.env.NETLIFY_BUILD = 'true'
  
  // 确保API路由知道这是构建时
  nextConfig.generateBuildId = () => {
    return `netlify-build-${Date.now()}`
  }
  
  // 禁用所有可能导致问题的功能
  nextConfig.pageExtensions = ['tsx', 'ts', 'jsx', 'js']
}

module.exports = nextConfig