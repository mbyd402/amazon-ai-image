'use client'

import { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

export default function EnvTestPage() {
  const [envInfo, setEnvInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkEnv = () => {
      const info = {
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isClient: typeof window !== 'undefined',
          isServer: typeof window === 'undefined'
        },
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
          urlFirst20: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'none',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***SET***' : 'NOT SET',
          anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
        },
        allEnvVars: {} as Record<string, string>
      }

      // 收集所有以 NEXT_PUBLIC_ 开头的环境变量（不显示完整值）
      Object.keys(process.env).forEach(key => {
        if (key.startsWith('NEXT_PUBLIC_')) {
          const value = process.env[key] || ''
          info.allEnvVars[key] = value.length > 50 ? 
            `${value.substring(0, 20)}...${value.substring(value.length - 20)} (${value.length} chars)` :
            value
        }
      })

      setEnvInfo(info)
      setLoading(false)
      
      // 输出到控制台
      console.log('🔍 环境变量测试:', info)
    }

    checkEnv()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🔍 检查环境变量...</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 环境变量诊断</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">运行环境</h3>
              <div className="space-y-2">
                <p><strong>NODE_ENV:</strong> {envInfo.environment.nodeEnv}</p>
                <p><strong>运行位置:</strong> {envInfo.environment.isClient ? '客户端' : '服务器端'}</p>
                <p><strong>时间戳:</strong> {new Date(envInfo.timestamp).toLocaleString()}</p>
              </div>
            </div>
            
            <div className={`p-4 ${envInfo.supabase.url ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} rounded-lg border`}>
              <h3 className={`text-lg font-semibold ${envInfo.supabase.url ? 'text-green-800' : 'text-red-800'} mb-3`}>
                {envInfo.supabase.url ? '✅ Supabase 配置' : '❌ Supabase 配置'}
              </h3>
              <div className="space-y-2">
                <p><strong>URL 状态:</strong> {envInfo.supabase.url ? `已设置 (${envInfo.supabase.urlLength} 字符)` : '未设置'}</p>
                <p><strong>URL 预览:</strong> {envInfo.supabase.urlFirst20}...</p>
                <p><strong>Anon Key 状态:</strong> {envInfo.supabase.anonKey}</p>
                <p><strong>Anon Key 长度:</strong> {envInfo.supabase.anonKeyLength} 字符</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">📊 所有 NEXT_PUBLIC_ 环境变量</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变量名</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">值预览</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(envInfo.allEnvVars).map(([key, value]) => (
                      <tr key={key}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{key}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 font-mono">
                          {typeof value === 'string' && value.includes('...') ? (
                            <span title={value}>{value}</span>
                          ) : (
                            String(value)
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {value ? '已设置' : '未设置'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">🔧 故障排除</h3>
            <div className="space-y-3">
              {!envInfo.supabase.url && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">❌ 关键问题：Supabase URL 未设置</h4>
                  <p className="text-red-700">NEXT_PUBLIC_SUPABASE_URL 环境变量未在客户端访问到。</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-red-600">可能原因：</p>
                    <ul className="text-sm text-red-600 list-disc pl-5">
                      <li>环境变量未正确添加到 Vercel</li>
                      <li>需要重新部署使环境变量生效</li>
                      <li>环境变量名称拼写错误</li>
                      <li>浏览器缓存了旧版本</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 解决步骤</h4>
                <ol className="text-blue-700 list-decimal pl-5 space-y-1">
                  <li>在 Vercel 中确认环境变量已保存</li>
                  <li>点击 "Redeploy" 重新部署站点</li>
                  <li>清除浏览器缓存或使用隐身模式</li>
                  <li>等待几分钟让部署完成</li>
                  <li>刷新此页面检查环境变量状态</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">📋 原始数据</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(envInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}