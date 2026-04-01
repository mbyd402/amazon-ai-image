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
  
  // Webpack配置：Cloudflare Pages 构建优化
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 简化服务器端构建
      config.optimization = {
        minimize: false,
      }
      
      // 禁用source maps
      config.devtool = false
      
      // Cloudflare Pages 环境：将 sharp 外部化（不打包）
      if (process.env.CF_PAGES || process.env.CLOUDFLARE_PAGES) {
        config.externals = [...(config.externals || []), 'sharp']
        console.log('🔧 Cloudflare Pages: externalizing sharp')
      }
    }
    
    return config
  },
}

// 🎯 Cloudflare Pages 环境配置
if (process.env.CF_PAGES || process.env.VERCEL) {
  console.log('🔧 Cloudflare Pages 或 Vercel 构建模式')
  
  // 标记构建环境
  process.env.IS_BUILD_TIME = 'true'
  
  // Cloudflare Pages 特定配置
  if (process.env.CF_PAGES) {
    console.log('☁️ 部署到 Cloudflare Pages')
    process.env.CLOUDFLARE_PAGES = 'true'
  }
  
  // Vercel 特定配置
  if (process.env.VERCEL) {
    console.log('▲ 部署到 Vercel')
  }
  
  // 确保API路由知道这是构建时
  nextConfig.generateBuildId = () => {
    const platform = process.env.CF_PAGES ? 'cloudflare' : 'vercel'
    return `${platform}-build-${Date.now()}`
  }
  
  // 禁用所有可能导致问题的功能
  nextConfig.pageExtensions = ['tsx', 'ts', 'jsx', 'js']
}

module.exports = nextConfig
