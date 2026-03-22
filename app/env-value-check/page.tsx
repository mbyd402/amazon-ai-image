'use client'

export default function EnvValueCheckPage() {
  // 安全地显示环境变量值
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  console.log('🔍 环境变量值检查:')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase URL 长度:', supabaseUrl.length)
  console.log('Supabase URL 是空字符串?', supabaseUrl === '')
  console.log('Supabase Key 长度:', supabaseKey.length)
  console.log('Supabase Key 是空字符串?', supabaseKey === '')
  
  // 检查是否有隐藏字符
  console.log('URL 字符代码:', supabaseUrl.split('').map(c => c.charCodeAt(0)).join(','))
  console.log('Key 前10字符代码:', supabaseKey.substring(0, 10).split('').map(c => c.charCodeAt(0)).join(','))
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 环境变量值检查</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">检测结果</h2>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${supabaseUrl ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_URL</h3>
              <p className="mb-2">
                状态: <strong>{supabaseUrl ? `✅ 有值 (${supabaseUrl.length} 字符)` : '❌ 空值'}</strong>
              </p>
              {supabaseUrl ? (
                <div>
                  <p className="text-sm text-gray-600 mb-1">值预览:</p>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                    {supabaseUrl.length > 50 
                      ? `${supabaseUrl.substring(0, 25)}...${supabaseUrl.substring(supabaseUrl.length - 25)}`
                      : supabaseUrl
                    }
                  </div>
                </div>
              ) : (
                <p className="text-red-600">值是空字符串！需要在 Vercel 中重新配置。</p>
              )}
            </div>
            
            <div className={`p-4 rounded-lg ${supabaseKey ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY</h3>
              <p className="mb-2">
                状态: <strong>{supabaseKey ? `✅ 有值 (${supabaseKey.length} 字符)` : '❌ 空值'}</strong>
              </p>
              {supabaseKey ? (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Key 预览:</p>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                    {supabaseKey.substring(0, 10)}...{supabaseKey.substring(supabaseKey.length - 10)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">总长度: {supabaseKey.length} 字符</p>
                </div>
              ) : (
                <p className="text-red-600">值是空字符串！需要在 Vercel 中重新配置。</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">💡 问题诊断</h2>
          
          {!supabaseUrl || !supabaseKey ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">❌ 确认的问题：环境变量值为空</h3>
              <p className="text-red-700 mb-3">
                Vercel 环境变量已配置，但值是空字符串。这通常是因为：
              </p>
              <ul className="list-disc pl-5 text-red-600 space-y-1">
                <li>变量值被意外清空</li>
                <li>复制粘贴时丢失了值</li>
                <li>Vercel 界面中的输入框留空</li>
                <li>特殊字符导致值被截断</li>
              </ul>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-yellow-800 mb-1">🔄 解决方案</h4>
                <ol className="list-decimal pl-5 text-yellow-700 space-y-1">
                  <li>在 Vercel 中删除现有环境变量</li>
                  <li>重新添加变量，确保值正确输入</li>
                  <li>检查值前后没有多余空格</li>
                  <li>手动触发重新部署</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ 环境变量值正常</h3>
              <p className="text-green-700">
                环境变量有正确的值。如果 Supabase 仍然报错，可能是其他配置问题。
              </p>
            </div>
          )}
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">控制台输出</h3>
          <p className="text-sm text-gray-600">
            查看浏览器控制台（F12 → Console）获取详细日志，包括字符代码分析。
          </p>
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
            Supabase URL 长度: {supabaseUrl.length} | Key 长度: {supabaseKey.length}
          </div>
        </div>
      </div>
    </div>
  )
}