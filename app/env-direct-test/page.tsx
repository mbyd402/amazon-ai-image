'use client'

export const dynamic = 'force-dynamic'

export default function EnvDirectTestPage() {
  // 直接测试环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('🔍 直接环境变量测试:', {
    supabaseUrl: supabaseUrl || '未找到',
    supabaseUrlLength: supabaseUrl?.length || 0,
    supabaseKey: supabaseKey ? '***已设置***' : '未找到',
    supabaseKeyLength: supabaseKey?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
  
  // 检查所有 process.env 键
  const allEnvKeys = Object.keys(process.env)
  const nextPublicKeys = allEnvKeys.filter(key => key.startsWith('NEXT_PUBLIC_'))
  
  console.log('📋 所有 NEXT_PUBLIC_ 键:', nextPublicKeys)
  console.log('📋 总共环境变量:', allEnvKeys.length)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 直接环境变量测试</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Supabase 配置状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${supabaseUrl ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_URL</h3>
              <p className={`font-mono text-sm ${supabaseUrl ? 'text-green-700' : 'text-red-700'}`}>
                {supabaseUrl ? `✅ 已设置 (${supabaseUrl.length} 字符)` : '❌ 未设置'}
              </p>
              {supabaseUrl && (
                <p className="text-xs text-gray-600 mt-2 break-all">
                  前20字符: {supabaseUrl.substring(0, 20)}...
                </p>
              )}
            </div>
            
            <div className={`p-4 rounded-lg ${supabaseKey ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY</h3>
              <p className={`font-mono text-sm ${supabaseKey ? 'text-green-700' : 'text-red-700'}`}>
                {supabaseKey ? `✅ 已设置 (${supabaseKey.length} 字符)` : '❌ 未设置'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">环境信息</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
                <p><strong>总环境变量:</strong> {allEnvKeys.length}</p>
              </div>
              <div>
                <p><strong>NEXT_PUBLIC_ 变量:</strong> {nextPublicKeys.length}</p>
                <p><strong>时间戳:</strong> {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">💡 诊断结果</h2>
          {!supabaseUrl || !supabaseKey ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">❌ 关键问题：环境变量未在客户端检测到</h3>
              <p className="text-red-700 mb-3">
                这可能是因为：
              </p>
              <ul className="list-disc pl-5 text-red-600 space-y-1">
                <li>环境变量未在 Vercel 中正确配置</li>
                <li>需要重新部署使环境变量生效</li>
                <li>Next.js 构建时未将环境变量内联到客户端</li>
                <li>环境变量名称不正确（必须是 NEXT_PUBLIC_ 前缀）</li>
              </ul>
              <div className="mt-4">
                <a 
                  href="https://vercel.com/docs/projects/environment-variables"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition inline-block"
                >
                  Vercel 环境变量文档
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ 环境变量检测正常</h3>
              <p className="text-green-700">
                Supabase 环境变量已在客户端正确检测到。问题可能在 Supabase 客户端初始化逻辑中。
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">控制台输出</h3>
          <p className="text-sm text-gray-600">
            查看浏览器控制台（F12 → Console）获取详细日志。
          </p>
        </div>
      </div>
    </div>
  )
}