'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProcessPage from '@/components/ProcessPage'
import { createSmartClient, checkEnvStatus } from '@/lib/supabase-hardcoded'

export default function DashboardHardcodedPage() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState<'background' | 'watermark' | 'upscale' | 'compliance'>('background')
  const router = useRouter()

  useEffect(() => {
    // 检查环境变量状态
    const status = checkEnvStatus()
    setEnvStatus(status)
    
    console.log('🔧 Dashboard 硬编码版本启动')
    console.log('环境变量状态:', status)
    
    // 模拟用户数据（硬编码）
    const mockUser = {
      id: 'hardcoded-user-123',
      email: 'test@example.com',
      created_at: new Date().toISOString()
    }
    
    const mockUserData = {
      id: 'hardcoded-user-data-123',
      user_id: 'hardcoded-user-123',
      remaining_points: 5,
      total_points: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // 延迟加载模拟真实情况
    setTimeout(() => {
      setUser(mockUser)
      setUserData(mockUserData)
      setLoading(false)
      
      console.log('✅ 硬编码用户数据加载完成:', { user: mockUser, userData: mockUserData })
    }, 1000)
    
    // 测试 Supabase 连接
    const testConnection = async () => {
      const client = createSmartClient()
      const session = await client.auth.getSession()
      console.log('🔗 Supabase 连接测试:', session)
    }
    
    testConnection()
  }, [])

  const handleLogout = () => {
    console.log('用户登出')
    router.push('/')
  }

  const handleBuyPoints = () => {
    if (!userData) return
    
    const newPoints = userData.remaining_points + 5
    setUserData({
      ...userData,
      remaining_points: newPoints,
      total_points: userData.total_points + 5
    })
    
    console.log('购买点数，新点数:', newPoints)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              加载 Dashboard...
            </p>
            {envStatus && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg inline-block">
                <p className="text-yellow-700 text-sm">
                  ⚠️ 使用硬编码配置（环境变量缺失）
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">无法加载用户数据</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'background', label: 'AI White Background', icon: '🖼️' },
    { id: 'watermark', label: 'Remove Watermark', icon: '🧹' },
    { id: 'upscale', label: 'Upscale & Enhance', icon: '🚀' },
    { id: 'compliance', label: 'Compliance Check', icon: '✅' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 环境变量状态提示 */}
        {envStatus?.shouldUseHardcoded && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-yellow-800 text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  使用硬编码配置
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Supabase 环境变量未正确配置。当前使用硬编码配置进行演示。</p>
                  <p className="mt-1">
                    <strong>需要修复：</strong> 在 Vercel 中正确配置以下环境变量：
                  </p>
                  <ul className="list-disc pl-5 mt-1">
                    <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
                    <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Image Tools Dashboard (硬编码版本)
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Welcome, {user.email} <span className="text-sm text-yellow-600">[演示账户]</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  剩余点数
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userData.remaining_points}
                </p>
                <button
                  onClick={handleBuyPoints}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  获取更多点数 →
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                登出
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Process Area */}
        <ProcessPage 
          operation={selectedTab} 
          userId={user.id} 
          remainingPoints={userData.remaining_points}
        />
        
        {/* 调试信息 */}
        <div className="mt-12 border-t pt-6">
          <details className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
              调试信息 (点击展开)
            </summary>
            <div className="mt-3 space-y-2">
              <p className="text-sm"><strong>环境变量状态:</strong> {envStatus?.shouldUseHardcoded ? '使用硬编码' : '使用环境变量'}</p>
              <p className="text-sm"><strong>Supabase URL:</strong> {envStatus?.envUrl || '未设置'}</p>
              <p className="text-sm"><strong>用户ID:</strong> {user.id}</p>
              <p className="text-sm"><strong>剩余点数:</strong> {userData.remaining_points}</p>
              <button
                onClick={() => console.log('调试信息:', { user, userData, envStatus })}
                className="mt-2 px-3 py-1 bg-gray-600 text-white text-sm rounded"
              >
                在控制台打印调试信息
              </button>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}