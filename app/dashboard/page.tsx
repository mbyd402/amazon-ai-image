'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, checkSupabaseConnection } from '@/lib/supabase'
import ProcessPage from '@/components/ProcessPage'
import FallbackDashboard from './fallback-dashboard'

// Cache keys
const CACHE_USER = 'amazon_ai_user'
const CACHE_USER_DATA = 'amazon_ai_user_data'
const CACHE_TIMESTAMP = 'amazon_ai_cache_time'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default function Dashboard() {
  // 检查是否应该使用降级模式
  const useFallbackMode = typeof window !== 'undefined' && 
    (localStorage.getItem('use_fallback_mode') === 'true' || 
     window.location.search.includes('fallback=true'))
  
  if (useFallbackMode) {
    return <FallbackDashboard />
  }
  
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'background' | 'watermark' | 'upscale' | 'compliance'>('background')
  const router = useRouter()

  const { PACKAGES } = require('@/lib/config');

  // Load from cache (只用于错误回退，不设置loading状态)
  const loadFromCache = useCallback(() => {
    try {
      const cachedUser = localStorage.getItem(CACHE_USER)
      const cachedUserData = localStorage.getItem(CACHE_USER_DATA)
      const cachedTime = localStorage.getItem(CACHE_TIMESTAMP)
      
      if (cachedUser && cachedUserData && cachedTime) {
        const age = Date.now() - parseInt(cachedTime)
        if (age < CACHE_DURATION) {
          setUser(JSON.parse(cachedUser))
          setUserData(JSON.parse(cachedUserData))
          console.log('Loaded from cache')
          return true
        }
      }
    } catch (e) {
      console.error('Cache error:', e)
    }
    return false
  }, [])

  // Save to cache
  const saveToCache = useCallback((user: any, userData: any) => {
    try {
      localStorage.setItem(CACHE_USER, JSON.stringify(user))
      localStorage.setItem(CACHE_USER_DATA, JSON.stringify(userData))
      localStorage.setItem(CACHE_TIMESTAMP, Date.now().toString())
    } catch (e) {
      console.error('Save cache error:', e)
    }
  }, [])

  // Clear cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_USER)
      localStorage.removeItem(CACHE_USER_DATA)
      localStorage.removeItem(CACHE_TIMESTAMP)
    } catch (e) {
      console.error('Clear cache error:', e)
    }
  }, [])

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // 先尝试从Supabase storage获取缓存的session（更可靠）
      const getPersistedSession = () => {
        try {
          const storageKey = 'supabase.auth.token'
          const stored = localStorage.getItem(storageKey)
          if (stored) {
            const session = JSON.parse(stored)
            if (session?.access_token && session?.expires_at) {
              const expiresAt = session.expires_at * 1000
              if (expiresAt > Date.now() + 60000) { // 至少还有1分钟有效期
                return { user: session.user }
              }
            }
          }
        } catch (e) {
          console.log('Failed to parse persisted session:', e)
        }
        return null
      }
      
      // 如果有持久化的session，先设置用户状态
      const persistedSession = getPersistedSession()
      if (persistedSession?.user && !forceRefresh) {
        setUser(persistedSession.user)
        console.log('Using persisted session from localStorage')
      }
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase request timeout (30s). This could be due to: 1) Ad blocker blocking supabase.co, 2) Network issues, 3) Supabase service temporarily unavailable. Try disabling ad blockers or use incognito mode.')), 30000)
      })

      const userPromise = supabase.auth.getUser()
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any
      
      if (!user) {
        clearCache()
        router.push('/login')
        return
      }
      setUser(user)
      
      // Check if user exists in our users table
      const { data, error: dbError } = await Promise.race([
        supabase
          .from('users')
          .select('remaining_points, total_points')
          .eq('id', user.id)
          .single(),
        timeoutPromise
      ]) as any
      
      // If user doesn't exist, create it with free points (for OAuth login)
      if (dbError && dbError.code === 'PGRST116') {
        console.log('Creating new user for OAuth login...')
        const { error: insertError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email!,
          remaining_points: PACKAGES.free.points,
          total_points: PACKAGES.free.points,
        })

        if (insertError) {
          console.error('Error creating user:', insertError)
        }

        // Refetch after creating
        const { data: newUserData } = await supabase
          .from('users')
          .select('remaining_points, total_points')
          .eq('id', user.id)
          .single()
        
        setUserData(newUserData)
        saveToCache(user, newUserData)
      } else {
        setUserData(data)
        saveToCache(user, data)
      }
      
      setLoading(false)
      console.log('Dashboard loaded successfully!')
    } catch (err) {
      console.error('Dashboard loading error:', err)
      
      // 如果Supabase请求失败，尝试使用缓存数据作为回退
      const cacheLoaded = loadFromCache()
      if (cacheLoaded) {
        console.log('Using cached data as fallback')
        setLoading(false)
      } else {
        // 没有缓存可用，显示错误并提供降级选项
        let errorMessage = 'Failed to load dashboard. '
        
        // 处理 TypeScript 的 unknown 类型
        const errorMessageText = err instanceof Error ? err.message : String(err)
        
        if (errorMessageText.includes('timeout')) {
          errorMessage += 'Supabase connection timed out. This could be due to: '
          errorMessage += '1) Ad blocker blocking supabase.co, '
          errorMessage += '2) Network issues, '
          errorMessage += '3) Supabase service temporarily unavailable.'
        } else if (errorMessageText.includes('Failed to fetch')) {
          errorMessage += 'Network error. Please check your internet connection.'
        } else {
          errorMessage += errorMessageText
        }
        
        setError(errorMessage)
        setLoading(false)
      }
    }
  }, [router, loadFromCache, saveToCache, clearCache])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRetry = () => {
    setIsRetrying(true)
    loadData(true).finally(() => setIsRetrying(false))
  }

  const handleLogout = async () => {
    clearCache()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Loading...
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              If this takes too long, check if your ad blocker is blocking supabase.co
            </p>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isRetrying ? 'Retrying...' : 'Try Now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg inline-block max-w-md">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Loading failed: {error}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This is usually caused by an ad blocker blocking supabase.co.
                <br />
                Try disabling your ad blocker or use incognito mode.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </button>
                <button 
                  onClick={() => {
                    // 切换到降级模式
                    localStorage.setItem('use_fallback_mode', 'true')
                    window.location.reload()
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Use Offline Mode
                </button>
              </div>
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

  // 调试信息（只在开发环境显示）
  const showDebugInfo = process.env.NODE_ENV === 'development' || 
    (typeof window !== 'undefined' && window.location.hostname.includes('localhost'))
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {showDebugInfo && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
            <details>
              <summary className="cursor-pointer font-medium">Debug Info</summary>
              <div className="mt-2 space-y-1">
                <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</div>
                <div>Cache: {localStorage.getItem(CACHE_USER) ? '✓ Has cache' : '✗ No cache'}</div>
                <div>Supabase Session: {localStorage.getItem('supabase.auth.token') ? '✓ Has session' : '✗ No session'}</div>
                <button 
                  onClick={() => {
                    console.log('Cache debug:', {
                      userCache: localStorage.getItem(CACHE_USER),
                      dataCache: localStorage.getItem(CACHE_USER_DATA),
                      timestamp: localStorage.getItem(CACHE_TIMESTAMP),
                      supabaseSession: localStorage.getItem('supabase.auth.token')
                    })
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Log Cache Info
                </button>
                <button 
                  onClick={async () => {
                    const connection = await checkSupabaseConnection()
                    console.log('Supabase connection test:', connection)
                    alert(`Connection: ${connection.connected ? 'OK' : 'FAILED'}\nDuration: ${connection.duration}ms\nError: ${connection.error || 'None'}`)
                  }}
                  className="ml-4 text-blue-600 hover:underline"
                >
                  Test Supabase Connection
                </button>
              </div>
            </details>
          </div>
        )}
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
                  <a 
                    href="/dashboard/buy" 
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Buy more points →
                  </a>
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
