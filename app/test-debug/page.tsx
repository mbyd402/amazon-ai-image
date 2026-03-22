'use client'

export const dynamic = 'force-dynamic'

export default function TestDebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔧 调试测试页面</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">页面状态检查</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-800">✅ 此页面可正常访问</p>
              <p className="text-sm text-green-600 mt-1">说明路由配置正常</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-800">📊 其他调试页面</p>
              <div className="mt-2 space-y-2">
                <a href="/debug" className="block px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">
                  /debug 页面
                </a>
                <a href="/debug-dashboard" className="block px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition">
                  /debug-dashboard 页面
                </a>
                <a href="/dashboard" className="block px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                  /dashboard 页面
                </a>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-800">🔍 环境信息</p>
              <div className="mt-2 text-sm">
                <p><strong>时间戳:</strong> {new Date().toISOString()}</p>
                <p><strong>客户端:</strong> {typeof window !== 'undefined' ? '浏览器' : '服务器'}</p>
                <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">故障排除</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>如果 /debug-dashboard 404，可能是构建失败或缓存问题</li>
            <li>检查 Netlify 构建日志是否有错误</li>
            <li>尝试清除浏览器缓存或使用隐身模式</li>
            <li>等待 Netlify 构建完成后再测试</li>
          </ul>
        </div>
      </div>
    </div>
  )
}