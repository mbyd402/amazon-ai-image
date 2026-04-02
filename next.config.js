/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  compiler: { removeConsole: false, emotion: false },
  experimental: {},
  output: 'standalone',
  images: { unoptimized: true, domains: [] },
  headers: async () => [],
  rewrites: async () => [],
  redirects: async () => [],
  trailingSlash: false,
  
  // 禁用静态预渲染，避免产生多余的 HTML 文件导致路由冲突
  staticPageGenerationTimeout: 0,
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = { minimize: false }
      config.devtool = false
    }
    return config
  },
}

if (process.env.CF_PAGES || process.env.VERCEL) {
  console.log('🔧 Cloudflare 或 Vercel 构建模式')
  process.env.IS_BUILD_TIME = 'true'
  
  if (process.env.CF_PAGES) {
    process.env.CLOUDFLARE_PAGES = 'true'
  }
  
  nextConfig.generateBuildId = () => {
    const platform = process.env.CF_PAGES ? 'cloudflare' : 'vercel'
    return `${platform}-build-${Date.now()}`
  }
  
  nextConfig.pageExtensions = ['tsx', 'ts', 'jsx', 'js']
  
  // 禁用 Cloudflare Pages 的预渲染功能
  nextConfig.output = undefined
}

module.exports = nextConfig
