'use client'

import { useState } from 'react'
import { checkSupabaseConnection, getSupabaseClient } from '@/lib/supabase'

export default function DebugPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [runningTest, setRunningTest] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const runConnectionTest = async () => {
    setLoading(true)
    setRunningTest('connection')
    
    try {
      const results = await checkSupabaseConnection()
      setTestResults(results)
      console.log('🔍 连接测试结果:', results)
    } catch (error: any) {
      setTestResults({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
      setRunningTest(null)
    }
  }

  const runDashboardSimulation = async () => {
    setLoading(true)
    setRunningTest('dashboard')
    
    try {
      const client = getSupabaseClient()
      const startTime = Date.now()
      
      // 模拟dashboard加载
      const { data: sessionData, error: sessionError } = await client.auth.getSession()
      const sessionTime = Date.now() - startTime
      
      let userData = null
      let userDataError = null
      let userDataTime = 0
      
      if (sessionData?.session?.user) {
        const userStartTime = Date.now()
        const { data, error } = await client
          .from('users')
          .select('*')
          .eq('user_id', sessionData.session.user.id)
          .single()
        
        userDataTime = Date.now() - userStartTime
        userData = data
        userDataError = error
      }
      
      setTestResults({
        success: !sessionError && !userDataError,
        simulation: {
          session: {
            success: !sessionError,
            time: sessionTime,
            error: sessionError?.message,
            hasUser: !!sessionData?.session?.user
          },
          userData: {
            success: !userDataError,
            time: userDataTime,
            error: userDataError?.message,
            data: userData
          },
          totalTime: Date.now() - startTime
        },
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      setTestResults({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
      setRunningTest(null)
    }
  }

  const exportDiagnostics = () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      testResults,
      localStorage: {
        auth: localStorage.getItem('amazon-ai-supabase-auth'),
        cache: localStorage.getItem('amazon_ai_dashboard_cache')
      }
    }
    
    const blob = new Blob([JSON.stringify(diagnostics, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `amazon-ai-diagnostics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Amazon AI 调试工具</h1>
          <p className="text-gray-600">诊断连接问题和性能瓶颈</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 测试卡片 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">连接测试</h2>
            <p className="text-gray-600 mb-6">
              检查Supabase连接状态，包括域名、API、认证和数据库。
            </p>
            <button
              onClick={runConnectionTest}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {runningTest === 'connection' ? '测试中...' : '运行基础连通性测试'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard模拟</h2>
            <p className="text-gray-600 mb-6">
              模拟实际dashboard加载过程，测量各阶段耗时。
            </p>
            <button
              onClick={runDashboardSimulation}
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {runningTest === 'dashboard' ? '模拟中...' : '模拟dashboard重试测试'}
            </button>
          </div>
        </div>

        {/* 结果展示 */}
        {testResults && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">测试结果</h2>
              <div className={`px-3 py-1 rounded-full ${testResults.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {testResults.success ? '✅ 成功' : '❌ 失败'}
              </div>
            </div>

            {/* 连接测试结果 */}
            {testResults.tests && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">连接测试详情</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(testResults.tests).map(([key, test]: [string, any]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 capitalize">{key}</span>
                        <span className={`text-sm ${test.success ? 'text-green-600' : 'text-red-600'}`}>
                          {test.success ? '✅' : '❌'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{test.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dashboard模拟结果 */}
            {testResults.simulation && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Dashboard模拟</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">用户会话</span>
                      <span className={`text-sm ${testResults.simulation.session.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.simulation.session.success ? '✅' : '❌'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      耗时: {testResults.simulation.session.time}ms
                      {testResults.simulation.session.error && ` | 错误: ${testResults.simulation.session.error}`}
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">用户数据</span>
                      <span className={`text-sm ${testResults.simulation.userData.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.simulation.userData.success ? '✅' : '❌'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      耗时: {testResults.simulation.userData.time}ms
                      {testResults.simulation.userData.error && ` | 错误: ${testResults.simulation.userData.error}`}
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">总耗时</span>
                      <span className="font-bold text-blue-600">
                        {testResults.simulation.totalTime}ms
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {testResults.simulation.totalTime > 5000 ? '⚠️ 加载较慢' : '✅ 加载正常'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 错误信息 */}
            {testResults.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">错误信息</h3>
                <p className="text-red-700">{testResults.error}</p>
              </div>
            )}

            {/* 元数据 */}
            <div className="border-t pt-4">
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>测试时间:</strong> {new Date(testResults.timestamp).toLocaleString()}</p>
                {testResults.environment && <p><strong>环境:</strong> {testResults.environment}</p>}
                {testResults.url && <p><strong>Supabase URL:</strong> {testResults.url}</p>}
                {testResults.key && <p><strong>API Key:</strong> {testResults.key}</p>}
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={exportDiagnostics}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              导出诊断报告
            </button>
            
            <button
              onClick={() => {
                localStorage.removeItem('amazon_ai_dashboard_cache')
                alert('缓存已清除')
              }}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              清除本地缓存
            </button>
            
            <a
              href="/dashboard"
              className="px-6 py-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
            >
              返回Dashboard
            </a>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-blue-800 mb-3">如何使用调试工具</h3>
          <ul className="space-y-2 text-blue-700">
            <li>1. <strong>连接测试</strong> - 检查Supabase基础连接是否正常</li>
            <li>2. <strong>Dashboard模拟</strong> - 重现用户加载dashboard的过程</li>
            <li>3. <strong>导出报告</strong> - 获取完整的诊断信息用于技术支持</li>
            <li>4. <strong>清除缓存</strong> - 解决缓存导致的显示问题</li>
          </ul>
          <p className="mt-4 text-sm text-blue-600">
            如果测试失败，请检查网络连接、浏览器控制台错误，或联系技术支持。
          </p>
        </div>
      </div>
    </div>
  )
}