/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  compiler: { removeConsole: false, emotion: false },
  // 禁用所有预渲染
  experimental: {
    ppr: false,
    inlineJs: false,
  },
  output: 'standalone',
  images: { unoptimized: true, domains: [] },
  
  // 禁用自动静态优化
  dynamicParams: true,
  dynamic: 'force-dynamic',
  
  // 禁用预渲染
  generateStaticParams: undefined,
  
  headers: async () => [],
  rewrites: async () => [],
  redirects: async () => [],
  trailingSlash: false,
  
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
}

module.exports = nextConfig
