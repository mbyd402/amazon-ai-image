'use client'

import { useEffect, useState } from 'react'

export default function EnvRuntimeOnlyPage() {
  const [envInfo, setEnvInfo] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // 确认我们在客户端
    setIsClient(true)
    
    // 只在客户端访问环境变量
    const info = {
      timestamp: new Date().toISOString(),
      runtimeCheck: {
        isClient: true,
        isServer: false,
        nodeEnv: process.env.NODE_ENV,
      },
      envVars: {
        // 这些只在客户端可访问
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_FOUND',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_FOUND',
        supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      },
      allNextPublicVars: Object.keys(process.env)
        .filter(key => key.startsWith('NEXT_PUBLIC_'))
        .map(key => ({
          key,
          length: process.env[key]?.length || 0,
          exists: !!process.env[key],
          isEmpty: process.env[key] === '',
        }))
    }
    
    setEnvInfo(info)
    
    console.log('=== 运行时环境变量测试 ===')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_FOUND')
    console.log('Supabase URL 长度:', process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0)
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log('所有 NEXT_PUBLIC_ 变量:', info.allNextPublicVars)
    console.log('=== 测试结束 ===')
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔄 运行时环境变量测试</h1>
          <p className="text-gray-600">正在初始化客户端环境...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔄 运行时环境变量测试</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">测试说明</h2>
          <p className="text-gray-600 mb-2">
            此页面只在客户端（浏览器）运行时检查环境变量，避免构建时的问题。
          </p>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <p className="text-blue-700 text-sm">
              <strong>关键区别：</strong> 构建时 vs 运行时。如果构建时环境变量不存在但运行时存在，说明是构建配置问题。
            </p>
          </div>
        </div>
        
        {envInfo ? (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">检测结果</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-lg ${envInfo.envVars.supabaseUrl !== 'NOT_FOUND' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_URL</h3>
                  <p className={envInfo.envVars.supabaseUrl !== 'NOT_FOUND' ? 'text-green-700' : 'text-red-700'}>
                    {envInfo.envVars.supabaseUrl !== 'NOT_FOUND' 
                      ? `✅ 已设置 (${envInfo.envVars.supabaseUrlLength} 字符)` 
                      : '❌ 未找到'}
                  </p>
                  {envInfo.envVars.supabaseUrl !== 'NOT_FOUND' && envInfo.envVars.supabaseUrlLength === 0 && (
                    <p className="text-red-600 text-sm mt-1">⚠️ 值是空字符串！</p>
                  )}
                </div>
                
                <div className={`p-4 rounded-lg ${envInfo.envVars.supabaseKey === 'SET' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY</h3>
                  <p className={envInfo.envVars.supabaseKey === 'SET' ? 'text-green-700' : 'text-red-700'}>
                    {envInfo.envVars.supabaseKey === 'SET' 
                      ? `✅ 已设置 (${envInfo.envVars.supabaseKeyLength} 字符)` 
                      : '❌ 未找到'}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">运行时环境</h3>
                <p><strong>运行环境:</strong> 客户端</p>
                <p><strong>NODE_ENV:</strong> {envInfo.runtimeCheck.nodeEnv}</p>
                <p><strong>NEXT_PUBLIC_ 变量数量:</strong> {envInfo.allNextPublicVars.length}</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">💡 诊断结论</h2>
              
              {envInfo.envVars.supabaseUrl === 'NOT_FOUND' || envInfo.envVars.supabaseKey === 'NOT_FOUND' ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">❌ 运行时环境变量缺失</h3>
                  <p className="text-red-700 mb-3">
                    即使在客户端运行时，环境变量仍然不可访问。这表明：
                  </p>
                  <ul className="list-disc pl-5 text-red-600 space-y-1">
                    <li><strong>Vercel 环境变量没有在构建时内联到客户端代码</strong></li>
                    <li>Next.js 没有将环境变量注入到客户端 bundle</li>
                    <li>可能需要检查 Vercel 构建日志中的环境变量处理</li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h4 className="font-semibold text-yellow-800 mb-1">🔄 解决方案</h4>
                    <ol className="list-decimal pl-5 text-yellow-700 space-y-1">
                      <li>在 Vercel 中清除构建缓存并重新部署</li>
                      <li>检查 Next.js 配置是否正确处理环境变量</li>
                      <li>考虑使用 <code>publicRuntimeConfig</code> 替代环境变量</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">✅ 运行时环境变量正常</h3>
                  <p className="text-green-700">
                    环境变量在客户端运行时正常访问。问题可能在：
                  </p>
                  <ul className="list-disc pl-5 text-green-600 space-y-1">
                    <li>构建时 vs 运行时的环境变量访问方式不同</li>
                    <li>某些组件在构建时访问了环境变量</li>
                    <li>静态生成页面时环境变量不可用</li>
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-600">正在检查环境变量...</p>
        )}
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">控制台输出</h3>
          <p className="text-sm text-gray-600">
            查看浏览器控制台（F12 → Console）获取详细日志。
          </p>
        </div>
      </div>
    </div>
  )
}