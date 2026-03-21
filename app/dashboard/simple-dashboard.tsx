'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProcessPage from '@/components/ProcessPage'

// 简单的本地存储管理
const getLocalUser = () => {
  if (typeof window === 'undefined') return null
  
  const userId = localStorage.getItem('local_user_id')
  const userEmail = localStorage.getItem('local_user_email')
  const userPoints = localStorage.getItem('local_user_points')
  
  if (userId && userEmail) {
    return {
      user: { id: userId, email: userEmail },
      userData: { 
        remaining_points: parseInt(userPoints || '3'),
        total_points: parseInt(userPoints || '3')
      }
    }
  }
  return null
}

const saveLocalUser = (userId: string, email: string, points: number = 3) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('local_user_id', userId)
  localStorage.setItem('local_user_email', email)
  localStorage.setItem('local_user_points', points.toString())
}

export default function SimpleDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'background' | 'watermark' | 'upscale' | 'compliance'>('background')
  const router = useRouter()

  useEffect(() => {
    // 检查URL参数（可能是OAuth回调）
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email')
    const userId = urlParams.get('userId') || urlParams.get('user_id')
    
    if (email && userId) {
      // 来自OAuth回调
      saveLocalUser(userId, email, 3)
      setUser({ id: userId, email })
      setUserData({ remaining_points: 3, total_points: 3 })
      
      // 清理URL
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
      setLoading(false)
      
    } else {
      // 尝试从localStorage加载
      const localUser = getLocalUser()
      if (localUser) {
        setUser(localUser.user)
        setUserData(localUser.userData)
        setLoading(false)
      } else {
        // 没有用户，重定向到本地登录
        router.push('/local-login')
      }
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('local_user_id')
    localStorage.removeItem('local_user_email')
    localStorage.removeItem('local_user_points')
    router.push('/local-login')
  }

  const handleBuyPoints = () => {
    const currentPoints = parseInt(localStorage.getItem('local_user_points') || '3')
    const newPoints = currentPoints + 10
    localStorage.setItem('local_user_points', newPoints.toString())
    setUserData({ remaining_points: newPoints, total_points: newPoints })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading...
            </p>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Image Tools Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Welcome, {user.email}
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
                <button
                  onClick={handleBuyPoints}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Get more points →
                </button>
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