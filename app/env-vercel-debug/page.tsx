'use client'

import { useEffect, useState } from 'react'

export default function EnvVercelDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const collectDebugInfo = () => {
      const info = {
        timestamp: new Date().toISOString(),
        
        // 1. 直接环境变量访问
        directEnv: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
          supabaseKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        },
        
        // 2. 所有环境变量键
        allEnvKeys: Object.keys(process.env),
        nextPublicKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
        
        // 3. 运行时环境
        runtime: {
          nodeEnv: process.env.NODE_ENV,
          isClient: typeof window !== 'undefined',
          isServer: typeof window === 'undefined',
          isProduction: process.env.NODE_ENV === 'production',
          isDevelopment: process.env.NODE_ENV === 'development',
        },
        
        // 4. 可能的构建信息
        buildInfo: {
          // Vercel 特定的环境变量
          vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL,
          vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
          vercelGitRepo: process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG,
          // 构建信息
          buildId: process.env.NEXT_PUBLIC_BUILD_ID,
        },
        
        // 5. Supabase 配置详情（安全地）
        supabaseConfig: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL 
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 8)}...${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(process.env.NEXT_PUBLIC_SUPABASE_URL.length - 8)}`
            : 'N/A',
          keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? `eyJ...${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length - 6)}`
            : 'N/A',
        }
      }
      
      setDebugInfo(info)
      setLoading(false)
      
      // 输出到控制台
      console.log('=== VERCEL 环境变量调试 ===')
      console.log('1. 直接访问:', info.directEnv)
      console.log('2. NEXT_PUBLIC_ 变量:', info.nextPublicKeys)
      console.log('3. 运行时环境:', info.runtime)
      console.log('4. 构建信息:', info.buildInfo)
      console.log('5. Supabase 配置:', info.supabaseConfig)
      console.log('=== 调试结束 ===')
      
      // 如果 Supabase URL 存在但为空，记录警告
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === '') {
        console.warn('⚠️ Supabase URL 存在但为空字符串！')
      }
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined) {
        console.error('❌ Supabase URL 未定义！')
      }
    }

    collectDebugInfo()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🔍 Vercel 环境变量调试 - 加载中...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 Vercel 环境变量调试</h1>
          
          {/* 问题诊断 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">⚠️ 问题诊断</h2>
            <div className={`p-4 rounded-lg ${debugInfo.directEnv.supabaseUrlExists ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${debugInfo.directEnv.supabaseUrlExists ? 'text-green-800' : 'text-red-800'}`}>
                {debugInfo.directEnv.supabaseUrlExists ? '✅ 环境变量检测到' : '❌ 环境变量未检测到'}
              </h3>
              
              {!debugInfo.directEnv.supabaseUrlExists && (
                <div className="space-y-3">
                  <p className="text-red-700"><strong>根本问题：</strong>环境变量在构建时未注入到客户端代码</p>
                  
                  <div className="bg-red-100 p-3 rounded">
                    <h4 className="font-semibold text-red-800 mb-1">可能原因：</h4>
                    <ul className="list-disc pl-5 text-red-700 space-y-1">
                      <li><strong>Vercel 环境变量名称错误</strong> - 必须完全匹配 `NEXT_PUBLIC_SUPABASE_URL`</li>
                      <li><strong>需要重新部署</strong> - 环境变量更改后必须重新部署</li>
                      <li><strong>Next.js 版本问题</strong> - Next.js 14+ 对环境变量处理有变化</li>
                      <li><strong>构建缓存</strong> - Vercel 可能缓存了旧构建</li>
                      <li><strong>环境变量作用域</strong> - 可能配置在错误的环境（Production/Preview）</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-100 p-3 rounded">
                    <h4 className="font-semibold text-blue-800 mb-1">解决方案：</h4>
                    <ol className="list-decimal pl-5 text-blue-700 space-y-1">
                      <li><strong>验证 Vercel 环境变量</strong> - 确认名称和值正确</li>
                      <li><strong>清除构建缓存</strong> - 在 Vercel 中清除缓存并重新部署</li>
                      <li><strong>检查构建日志</strong> - 查看环境变量是否在构建时被读取</li>
                      <li><strong>尝试硬编码测试</strong> - 确认代码本身没有问题</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 详细信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">环境变量状态</h3>
              <div className="space-y-2">
                <p><strong>Supabase URL:</strong> {debugInfo.directEnv.supabaseUrlExists ? '✅ 存在' : '❌ 不存在'}</p>
                <p><strong>URL 长度:</strong> {debugInfo.directEnv.supabaseUrlLength} 字符</p>
                <p><strong>Supabase Key:</strong> {debugInfo.directEnv.supabaseKeyExists ? '✅ 存在' : '❌ 不存在'}</p>
                <p><strong>Key 长度:</strong> {debugInfo.directEnv.supabaseKeyLength} 字符</p>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">运行时信息</h3>
              <div className="space-y-2">
                <p><strong>NODE_ENV:</strong> {debugInfo.runtime.nodeEnv}</p>
                <p><strong>运行环境:</strong> {debugInfo.runtime.isClient ? '客户端' : '服务器端'}</p>
                <p><strong>NEXT_PUBLIC_ 变量数:</strong> {debugInfo.nextPublicKeys.length}</p>
                <p><strong>总环境变量数:</strong> {debugInfo.allEnvKeys.length}</p>
              </div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">🔧 操作</h3>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                刷新页面
              </button>
              <a 
                href="https://vercel.com/docs/projects/environment-variables"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
              >
                Vercel 文档
              </a>
              <a 
                href="/env-simple-test"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                简单测试
              </a>
              <a 
                href="/dashboard-diagnosis"
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
              >
                Dashboard 诊断
              </a>
            </div>
          </div>
        </div>
        
        {/* 原始数据 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">📊 原始调试数据</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}