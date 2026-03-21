'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProcessPage from '@/components/ProcessPage'

// 本地缓存键
const LOCAL_USER_KEY = 'amazon_ai_local_user'
const LOCAL_USER_DATA_KEY = 'amazon_ai_local_user_data'

export default function FallbackDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'background' | 'watermark' | 'upscale' | 'compliance'>('background')
  const router = useRouter()

  const { PACKAGES } = require('@/lib/config')

  useEffect(() => {
    // 尝试从本地存储加载用户数据
    try {
      const storedUser = localStorage.getItem(LOCAL_USER_KEY)
      const storedUserData = localStorage.getItem(LOCAL_USER_DATA_KEY)
      
      if (storedUser && storedUserData) {
        setUser(JSON.parse(storedUser))
        setUserData(JSON.parse(storedUserData))
        setLoading(false)
        console.log('Loaded from local storage (fallback mode)')
        return
      }
    } catch (e) {
      console.error('Failed to load from local storage:', e)
    }
    
    // 如果没有本地数据，检查URL参数（可能是OAuth回调）
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email')
    const userId = urlParams.get('userId')
    
    if (email && userId) {
      // 从OAuth回调创建本地用户
      const newUser = {
        id: userId,
        email: email
      }
      const newUserData = {
        remaining_points: PACKAGES.free.points,
        total_points: PACKAGES.free.points
      }
      
      setUser(newUser)
      setUserData(newUserData)
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser))
      localStorage.setItem(LOCAL_USER_DATA_KEY, JSON.stringify(newUserData))
      setLoading(false)
      
      // 清理URL参数
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    } else {
      // 没有用户数据，重定向到登录页
      router.push('/login?mode=local')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_USER_KEY)
    localStorage.removeItem(LOCAL_USER_DATA_KEY)
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading in fallback mode...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg inline-block max-w-md">
              <p className="text-red-600 dark:text-red-400 mb-4">
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userData) {
    return null
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
        {/* 警告横幅 - 工作在降级模式 */}
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Working in offline mode</strong> - Supabase connection unavailable. 
                Your data is saved locally. Some features may be limited.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Image Tools Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Welcome back, {user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Remaining Points
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userData.remaining_points}
                </p>
                {userData.remaining_points <= 0 && (
                  <button
                    onClick={() => alert('Payment integration requires Supabase connection')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Buy more points →
                  </button>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Logout
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
      </div>
    </div>
  )
}