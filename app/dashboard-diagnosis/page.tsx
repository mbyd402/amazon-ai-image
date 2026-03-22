'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function DashboardDiagnosisPage() {
  const [diagnosis, setDiagnosis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runDiagnosis = async () => {
      const results: any = {
        timestamp: new Date().toISOString(),
        environment: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
          nodeEnv: process.env.NODE_ENV,
          isClient: typeof window !== 'undefined'
        },
        supabase: {},
        routing: {},
        localStorage: {}
      }

      // 检查Supabase客户端
      try {
        const supabase = createClient()
        const session = await supabase.auth.getSession()
        
        results.supabase = {
          clientCreated: true,
          hasSession: !!session.data?.session,
          sessionError: session.error?.message || '无错误',
          sessionUser: session.data?.session?.user?.email || '无用户'
        }
      } catch (error: any) {
        results.supabase = {
          clientCreated: false,
          error: error.message,
          stack: error.stack
        }
      }

      // 检查localStorage
      if (typeof window !== 'undefined') {
        results.localStorage = {
          hasLocalUser: !!localStorage.getItem('local_user_id'),
          localUserId: localStorage.getItem('local_user_id'),
          localUserEmail: localStorage.getItem('local_user_email')
        }
      }

      // 检查当前页面信息
      results.routing = {
        currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        queryParams: typeof window !== 'undefined' ? window.location.search : 'none',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
      }

      setDiagnosis(results)
      setLoading(false)
    }

    runDiagnosis()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🔍 Dashboard 诊断中...</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 Dashboard 诊断报告</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">环境配置</h3>
              <div className="space-y-2">
                <p><strong>Supabase URL:</strong> {diagnosis.environment.supabaseUrl}</p>
                <p><strong>NODE_ENV:</strong> {diagnosis.environment.nodeEnv}</p>
                <p><strong>运行环境:</strong> {diagnosis.environment.isClient ? '客户端' : '服务器端'}</p>
                <p><strong>诊断时间:</strong> {new Date(diagnosis.timestamp).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Supabase 状态</h3>
              <div className="space-y-2">
                <p><strong>客户端创建:</strong> {diagnosis.supabase.clientCreated ? '✅ 成功' : '❌ 失败'}</p>
                <p><strong>用户会话:</strong> {diagnosis.supabase.hasSession ? '✅ 已登录' : '❌ 未登录'}</p>
                <p><strong>用户邮箱:</strong> {diagnosis.supabase.sessionUser || '无'}</p>
                {diagnosis.supabase.error && (
                  <p><strong>错误信息:</strong> <span className="text-red-600">{diagnosis.supabase.error}</span></p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">路由和页面信息</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p><strong>当前路径:</strong> {diagnosis.routing.currentPath}</p>
                </div>
                <div>
                  <p><strong>用户代理:</strong> <span className="text-sm">{diagnosis.routing.userAgent?.slice(0, 50)}...</span></p>
                </div>
                <div>
                  <p><strong>LocalStorage 用户:</strong> {diagnosis.localStorage.hasLocalUser ? '✅ 有本地用户' : '❌ 无本地用户'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">💡 问题诊断</h3>
            <div className="space-y-4">
              {!diagnosis.environment.supabaseUrl && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">❌ 严重问题：Supabase 环境变量未配置</h4>
                  <p className="text-red-700">NEXT_PUBLIC_SUPABASE_URL 环境变量未设置，导致 Supabase 无法连接。</p>
                  <p className="text-sm text-red-600 mt-2">解决方案：在 Netlify 环境变量中配置 Supabase URL 和 Anon Key。</p>
                </div>
              )}
              
              {diagnosis.localStorage.hasLocalUser && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 检测到本地存储用户</h4>
                  <p className="text-yellow-700">系统可能在使用本地存储的备用 Dashboard 版本。</p>
                  <p className="text-sm text-yellow-600 mt-2">用户ID: {diagnosis.localStorage.localUserId}</p>
                  <p className="text-sm text-yellow-600">用户邮箱: {diagnosis.localStorage.localUserEmail}</p>
                </div>
              )}
              
              {diagnosis.supabase.clientCreated && !diagnosis.supabase.hasSession && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">ℹ️ 未检测到用户会话</h4>
                  <p className="text-blue-700">Supabase 客户端已创建，但没有活跃的用户会话。</p>
                  <div className="mt-2">
                    <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                      前往登录页面
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">操作指南</h3>
            <div className="flex flex-wrap gap-3">
              <a href="/dashboard" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition">
                测试主 Dashboard
              </a>
              <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                测试登录页面
              </a>
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('local_user_id')
                    localStorage.removeItem('local_user_email')
                    localStorage.removeItem('local_user_points')
                    window.location.reload()
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                清除本地存储
              </button>
              <a href="/debug" className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition">
                运行完整诊断
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">📊 原始诊断数据</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(diagnosis, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}