'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProcessPage from '@/components/ProcessPage'

// 完全不依赖环境变量的 Dashboard
export default function DashboardNoEnvPage() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'background' | 'watermark' | 'upscale' | 'compliance'>('background')
  const router = useRouter()

  // 硬编码配置 - 完全不依赖环境变量
  const HARDCODED_CONFIG = {
    supabaseUrl: 'https://hglupebrcszqblgxlsnu.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHVwZWJrc3p6cWJsZ3hsc251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwMDQ4MDAsImV4cCI6MjAyNjU4MDgwMH0.3cqlQw6vT5w5q5w6vT5w5q5w6vT5w5q5w6vT5w5q5w',
    isHardcoded: true,
    timestamp: new Date().toISOString()
  }

  useEffect(() => {
    console.log('🚀 启动无环境变量 Dashboard')
    console.log('硬编码配置:', {
      supabaseUrl: HARDCODED_CONFIG.supabaseUrl.substring(0, 30) + '...',
      supabaseKey: HARDCODED_CONFIG.supabaseKey.substring(0, 10) + '...',
      isHardcoded: true
    })
    
    // 检查 URL 参数（模拟 OAuth 回调）
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email') || 'demo@example.com'
    const userId = urlParams.get('userId') || 'demo-user-' + Date.now().toString().slice(-6)
    
    // 创建模拟用户数据
    const mockUser = {
      id: userId,
      email: email,
      created_at: new Date().toISOString()
    }
    
    const mockUserData = {
      id: 'demo-data-' + Date.now().toString().slice(-6),
      user_id: userId,
      remaining_points: 8,
      total_points: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // 保存到 localStorage 以便持久化
    if (typeof window !== 'undefined') {
      localStorage.setItem('noenv_user_id', userId)
      localStorage.setItem('noenv_user_email', email)
      localStorage.setItem('noenv_user_points', '8')
    }
    
    // 模拟网络延迟
    setTimeout(() => {
      setUser(mockUser)
      setUserData(mockUserData)
      setLoading(false)
      
      console.log('✅ 模拟用户数据加载完成:', {
        user: { id: mockUser.id, email: mockUser.email },
        points: mockUserData.remaining_points
      })
    }, 800)
    
    // 清理 URL 参数
    if (urlParams.has('email') || urlParams.has('userId')) {
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
    }
  }, [])

  const handleLogout = () => {
    console.log('用户登出')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('noenv_user_id')
      localStorage.removeItem('noenv_user_email')
      localStorage.removeItem('noenv_user_points')
    }
    router.push('/')
  }

  const handleBuyPoints = () => {
    if (!userData) return
    
    const newPoints = userData.remaining_points + 10
    const updatedUserData = {
      ...userData,
      remaining_points: newPoints,
      total_points: userData.total_points + 10
    }
    
    setUserData(updatedUserData)
    
    // 更新 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('noenv_user_points', newPoints.toString())
    }
    
    console.log('购买点数，新点数:', newPoints)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-pulse mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              AI Image Tools
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              正在加载您的 Dashboard...
            </p>
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg inline-block">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                ⚡ 使用本地存储模式（无需环境变量）
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            无法加载用户数据
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition shadow-lg"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'background', label: 'AI White Background', icon: '🖼️', color: 'from-blue-500 to-cyan-500' },
    { id: 'watermark', label: 'Remove Watermark', icon: '🧹', color: 'from-green-500 to-emerald-500' },
    { id: 'upscale', label: 'Upscale & Enhance', icon: '🚀', color: 'from-purple-500 to-pink-500' },
    { id: 'compliance', label: 'Compliance Check', icon: '✅', color: 'from-orange-500 to-red-500' },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 环境警告 */}
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                演示模式
              </h3>
              <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                <p>当前使用本地存储模式运行。所有数据存储在您的浏览器中。</p>
                <p className="mt-1">
                  <strong>注意：</strong> 这是临时解决方案。生产环境需要配置 Supabase 环境变量。
                </p>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => {
                    console.log('配置详情:', HARDCODED_CONFIG)
                    alert('这是演示版本。生产环境需要配置 Supabase 环境变量。')
                  }}
                  className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800"
                >
                  查看配置详情
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Image Tools Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                欢迎回来，<span className="font-semibold text-gray-800 dark:text-gray-200">{user.email}</span>
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                用户ID: <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{user.id}</code>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 px-5 py-4 rounded-xl shadow">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  剩余点数
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {userData.remaining_points}
                  </p>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-500">
                    / {userData.total_points}
                  </span>
                </div>
                <button
                  onClick={handleBuyPoints}
                  className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-lg hover:from-blue-600 hover:to-cyan-600 transition shadow-md"
                >
                  🎁 获取更多点数
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-2">
            <nav className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                    flex-1 min-w-[150px] px-4 py-3 rounded-lg transition-all duration-200
                    ${selectedTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-xl mr-3">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Process Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <ProcessPage 
            operation={selectedTab} 
            userId={user.id} 
            remainingPoints={userData.remaining_points}
          />
        </div>

        {/* 调试面板 */}
        <div className="mt-8">
          <details className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <span className="mr-2">🔧</span>
              调试信息
            </summary>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">用户信息</p>
                  <p className="text-sm mt-1">邮箱: {user.email}</p>
                  <p className="text-sm">ID: <code className="text-xs">{user.id}</code></p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">点数信息</p>
                  <p className="text-sm mt-1">剩余: {userData.remaining_points}</p>
                  <p className="text-sm">总共: {userData.total_points}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log('=== 无环境变量 Dashboard 调试 ===')
                  console.log('用户:', user)
                  console.log('用户数据:', userData)
                  console.log('配置:', HARDCODED_CONFIG)
                  console.log('当前标签:', selectedTab)
                  alert('调试信息已打印到控制台')
                }}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
              >
                打印调试信息到控制台
              </button>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}