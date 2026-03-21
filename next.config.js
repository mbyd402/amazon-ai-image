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
  }
}

module.exports = nextConfig
