'use client'

import { useEffect, useState } from 'react'

export default function VercelEnvTestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runAllTests = () => {
      const results = {
        timestamp: new Date().toISOString(),
        
        // 测试1：直接环境变量访问
        test1_directAccess: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_FOUND',
          supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
          supabaseKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        },
        
        // 测试2：所有 NEXT_PUBLIC_ 变量
        test2_allNextPublicVars: Object.keys(process.env)
          .filter(key => key.startsWith('NEXT_PUBLIC_'))
          .map(key => {
            const value = process.env[key] || ''
            return {
              key,
              valuePreview: value.length > 0 
                ? `${value.substring(0, 5)}...${value.substring(Math.max(0, value.length - 5))} (${value.length} chars)`
                : 'empty',
              length: value.length,
              isEmpty: value === '',
              isNull: value === null,
              isUndefined: value === undefined,
            }
          }),
        
        // 测试3：Vercel 特定变量
        test3_vercelVars: {
          vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL || 'NOT_FOUND',
          vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || 'NOT_FOUND',
          vercelGitRepo: process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG || 'NOT_FOUND',
          vercelProjectUrl: process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || 'NOT_FOUND',
        },
        
        // 测试4：运行时环境
        test4_runtime: {
          nodeEnv: process.env.NODE_ENV,
          isClient: typeof window !== 'undefined',
          isProduction: process.env.NODE_ENV === 'production',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A',
        },
        
        // 诊断结论
        diagnosis: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseUrlIsEmpty: process.env.NEXT_PUBLIC_SUPABASE_URL === '',
          supabaseKeyIsEmpty: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === '',
          hasAnyNextPublicVars: Object.keys(process.env).some(k => k.startsWith('NEXT_PUBLIC_')),
          totalNextPublicVars: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')).length,
          vercelVarsDetected: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_VERCEL_')).length,
        }
      }
      
      setTestResults(results)
      setLoading(false)
      
      // 输出到控制台
      console.log('=== VERCEL 环境变量全面测试 ===')
      console.log('Supabase URL:', results.test1_directAccess.supabaseUrl)
      console.log('Supabase URL 长度:', results.test1_directAccess.supabaseUrlLength)
      console.log('Supabase Key 存在:', results.test1_directAccess.supabaseKeyExists)
      console.log('Supabase Key 长度:', results.test1_directAccess.supabaseKeyLength)
      console.log('所有 NEXT_PUBLIC_ 变量数量:', results.diagnosis.totalNextPublicVars)
      console.log('Vercel 变量数量:', results.diagnosis.vercelVarsDetected)
      console.log('诊断结论:', results.diagnosis)
      console.log('=== 测试结束 ===')
    }
    
    runAllTests()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🧪 Vercel 环境变量全面测试 - 加载中...</h1>
        </div>
      </div>
    )
  }

  const diagnosis = testResults.diagnosis

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 Vercel 环境变量全面测试</h1>
          
          {/* 关键诊断 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🔍 关键诊断</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${diagnosis.hasSupabaseUrl ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold mb-1">Supabase URL</h3>
                <p className={diagnosis.hasSupabaseUrl ? 'text-green-700' : 'text-red-700'}>
                  {diagnosis.hasSupabaseUrl ? '✅ 存在' : '❌ 缺失'}
                </p>
                {diagnosis.supabaseUrlIsEmpty && (
                  <p className="text-red-600 text-sm mt-1">⚠️ 值为空字符串</p>
                )}
              </div>
              
              <div className={`p-4 rounded-lg ${diagnosis.hasSupabaseKey ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold mb-1">Supabase Key</h3>
                <p className={diagnosis.hasSupabaseKey ? 'text-green-700' : 'text-red-700'}>
                  {diagnosis.hasSupabaseKey ? '✅ 存在' : '❌ 缺失'}
                </p>
                {diagnosis.supabaseKeyIsEmpty && (
                  <p className="text-red-600 text-sm mt-1">⚠️ 值为空字符串</p>
                )}
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-1">NEXT_PUBLIC 变量</h3>
                <p className="text-blue-700">{diagnosis.totalNextPublicVars} 个</p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold mb-1">Vercel 变量</h3>
                <p className="text-purple-700">{diagnosis.vercelVarsDetected} 个</p>
              </div>
            </div>
            
            {/* 问题分析 */}
            {(!diagnosis.hasSupabaseUrl || !diagnosis.hasSupabaseKey) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">❌ 问题分析</h3>
                
                {diagnosis.totalNextPublicVars > 0 ? (
                  <div>
                    <p className="text-red-700 mb-2">
                      Vercel 成功注入了 <strong>{diagnosis.totalNextPublicVars}</strong> 个 NEXT_PUBLIC_ 变量，
                      但 Supabase 变量缺失或为空。
                    </p>
                    <p className="text-red-600">可能原因：</p>
                    <ul className="list-disc pl-5 text-red-600 mt-1 space-y-1">
                      <li>环境变量名称不正确（大小写敏感）</li>
                      <li>变量值在 Vercel 中被设置为空</li>
                      <li>环境变量配置在错误的环境（非 Production）</li>
                      <li>Vercel 项目配置问题</li>
                    </ul>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-700 mb-2">
                      没有检测到任何 NEXT_PUBLIC_ 环境变量。
                    </p>
                    <p className="text-red-600">可能原因：</p>
                    <ul className="list-disc pl-5 text-red-600 mt-1 space-y-1">
                      <li>Vercel 没有注入环境变量</li>
                      <li>Next.js 构建时环境变量不可用</li>
                      <li>构建配置有问题</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 详细测试结果 */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">📋 所有 NEXT_PUBLIC_ 变量</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {testResults.test2_allNextPublicVars.length > 0 ? (
                  <div className="space-y-3">
                    {testResults.test2_allNextPublicVars.map((item: any, index: number) => (
                      <div key={index} className="p-3 bg-white border border-gray-100 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-mono text-sm font-semibold text-gray-800">{item.key}</p>
                            <p className="text-sm text-gray-600 mt-1">{item.valuePreview}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 text-xs rounded ${item.length > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.length > 0 ? `${item.length} 字符` : '空'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">没有检测到 NEXT_PUBLIC_ 变量</p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">⚙️ 解决方案</h2>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">重新创建 Vercel 项目步骤：</h3>
                <ol className="list-decimal pl-5 text-blue-700 space-y-2">
                  <li><strong>创建新项目</strong>：Vercel → New Project → 导入 GitHub 仓库</li>
                  <li><strong>正确配置环境变量</strong>：
                    <ul className="list-disc pl-5 mt-1 text-blue-600">
                      <li><code>NEXT_PUBLIC_SUPABASE_URL</code> = 你的 Supabase URL</li>
                      <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> = 你的 Supabase Anon Key</li>
                      <li>确保勾选 <strong>Production</strong> 环境</li>
                    </ul>
                  </li>
                  <li><strong>部署并测试</strong>：访问新域名测试环境变量</li>
                  <li><strong>对比结果</strong>：与旧项目对比诊断问题</li>
                </ol>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-1">💡 重要提示</h4>
                  <p className="text-yellow-700 text-sm">
                    如果新项目环境变量工作正常，说明旧项目有配置或缓存问题。
                    如果新项目也有同样问题，可能是代码或 Next.js 配置问题。
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 控制台输出 */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">控制台信息</h3>
            <p className="text-sm text-gray-600 mb-2">
              详细日志已输出到浏览器控制台（F12 → Console）
            </p>
            <button
              onClick={() => {
                console.log('=== 手动重新测试 ===')
                console.log('当前环境变量:', testResults)
                alert('已在控制台打印当前测试结果')
              }}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition text-sm"
            >
              在控制台打印当前结果
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}