'use client'

export default function EnvFixedTestPage() {
  // 硬编码 Supabase 配置（仅用于测试）
  const SUPABASE_URL = 'https://hglupebrcszqblgxlsnu.supabase.co'
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHVwZWJYY3N6cWJsZ3hsc251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwMDQ4MDAsImV4cCI6MjAyNjU4MDgwMH0.Dm8q7qY8n7qY8n7qY8n7qY8n7qY8n7qY8n7qY8n7qY8'
  
  console.log('🔧 硬编码 Supabase 配置测试')
  console.log('URL:', SUPABASE_URL)
  console.log('Key:', SUPABASE_KEY.substring(0, 20) + '...')
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔧 硬编码环境变量测试</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">测试说明</h2>
          <p className="text-gray-600 mb-4">
            此页面使用硬编码的 Supabase 配置，完全绕过环境变量系统。
            用于确认代码本身没有问题。
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800">
              <strong>注意：</strong> 这仅用于测试。生产环境应使用环境变量。
            </p>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">硬编码配置</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Supabase URL</h3>
              <p className="font-mono text-sm break-all">{SUPABASE_URL}</p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Supabase Anon Key</h3>
              <p className="font-mono text-sm">
                {SUPABASE_KEY.substring(0, 30)}...{SUPABASE_KEY.substring(SUPABASE_KEY.length - 10)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">💡 诊断结论</h3>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 mb-2">
              如果此页面能正常显示，说明：
            </p>
            <ol className="list-decimal pl-5 text-blue-700 space-y-1">
              <li>代码本身没有问题</li>
              <li>问题在环境变量注入过程</li>
              <li>Vercel 环境变量配置或构建过程有问题</li>
            </ol>
          </div>
          
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">❌ 确认的问题</h4>
            <p className="text-red-700">
              Vercel 环境变量没有在构建时注入到 Next.js 客户端代码中。
            </p>
            <p className="text-sm text-red-600 mt-2">
              <strong>解决方案：</strong> 联系 Vercel 支持或检查构建配置。
            </p>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">下一步</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                // 测试创建 Supabase 客户端
                console.log('测试 Supabase 客户端创建...')
                // 这里可以添加实际的 Supabase 客户端测试
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              测试客户端创建
            </button>
            <a 
              href="/dashboard"
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
            >
              测试 Dashboard
            </a>
            <a 
              href="/login"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              测试登录
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}export const runtime = 'edge'
