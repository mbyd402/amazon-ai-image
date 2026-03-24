'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

// 🎯 智能缓存系统 - 10分钟缓存
const CACHE_KEY = 'amazon_ai_dashboard_cache'
const CACHE_DURATION = 10 * 60 * 1000 // 10分钟

// 🔧 连接状态类型
type ConnectionStatus = 'online' | 'offline' | 'slow' | 'checking'

export default function OptimizedDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking')
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [selectedTab, setSelectedTab] = useState<'background' | 'watermark' | 'upscale' | 'compliance'>('background')
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<string[]>([])

  // 🎯 创建Supabase客户端
  const supabase = createClient()

  // 🎯 智能缓存系统
  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null
      
      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp
      
      if (age < CACHE_DURATION) {
        console.log(`📦 使用缓存数据 (${Math.round(age/1000)}秒前)`)
        return data
      }
      console.log('📦 缓存过期，重新获取')
      return null
    } catch (err) {
      console.error('📦 缓存读取失败:', err)
      return null
    }
  }

  const saveToCache = (data: any) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
      console.log('📦 数据已缓存')
    } catch (err) {
      console.error('📦 缓存保存失败:', err)
    }
  }

  // 🎯 连接状态检测
  const checkConnection = async () => {
    setConnectionStatus('checking')
    
    try {
      const startTime = Date.now()
      const { data, error } = await supabase.auth.getSession()
      const responseTime = Date.now() - startTime
      
      if (responseTime > 5000) {
        setConnectionStatus('slow')
        console.warn(`⚠️ 连接缓慢: ${responseTime}ms`)
      } else if (error) {
        setConnectionStatus('offline')
        console.error('❌ 连接失败:', error.message)
      } else {
        setConnectionStatus('online')
        console.log(`✅ 连接正常: ${responseTime}ms`)
      }
    } catch (err) {
      setConnectionStatus('offline')
      console.error('❌ 连接检测失败:', err)
    }
  }

  // 🎯 加载用户数据（智能重试）
  const loadUserData = async (useCache = true) => {
    setLoading(true)
    setError(null)
    
    try {
      // 1. 尝试从缓存加载
      if (useCache) {
        const cachedData = loadFromCache()
        if (cachedData) {
          setUserData(cachedData)
          setLastUpdate('从缓存加载')
          setLoading(false)
          
          // 后台更新
          setTimeout(() => loadUserData(false), 1000)
          return
        }
      }

      // 2. 检查用户会话
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error(`认证失败: ${sessionError.message}`)
      }
      
      if (!sessionData.session) {
        setUser(null)
        setUserData(null)
        setLoading(false)
        return
      }
      
      setUser(sessionData.session.user)
      
      // 3. 获取用户数据（带超时）
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('请求超时，请检查网络连接')), 15000)
      )
      
      const userDataPromise = supabase
        .from('users')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .single()
      
      const userData = await Promise.race([userDataPromise, timeoutPromise]) as any
      
      if (userData.error) {
        throw new Error(`数据获取失败: ${userData.error.message}`)
      }
      
      // 4. 成功处理
      setUserData(userData.data)
      saveToCache(userData.data)
      setLastUpdate(new Date().toLocaleTimeString())
      setRetryCount(0)
      setConnectionStatus('online')
      
    } catch (err: any) {
      console.error('❌ Dashboard加载错误:', err)
      setError(err.message || '加载失败，请稍后重试')
      setConnectionStatus('offline')
      
      // 智能重试逻辑
      if (retryCount < 3) {
        const delay = Math.min(3000, 1000 * (retryCount + 1))
        console.log(`🔄 ${delay}ms后重试 (${retryCount + 1}/3)`)
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          loadUserData(false)
        }, delay)
      }
    } finally {
      setLoading(false)
    }
  }

  // 🎯 初始化加载
  useEffect(() => {
    console.log('🚀 优化Dashboard加载中...')
    checkConnection()
    loadUserData(true)
    
    // 定期检查连接
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  // 🎯 手动重试
  const handleRetry = () => {
    setRetryCount(0)
    loadUserData(false)
  }

  // 🎯 清空缓存重新加载
  const handleClearCache = () => {
    localStorage.removeItem(CACHE_KEY)
    loadUserData(false)
  }

  // 🎯 渲染连接状态指示器
  const renderConnectionStatus = () => {
    const statusConfig = {
      online: { emoji: '✅', text: 'Online', color: 'text-green-600' },
      offline: { emoji: '❌', text: 'Offline', color: 'text-red-600' },
      slow: { emoji: '⚠️', text: 'Slow', color: 'text-yellow-600' },
      checking: { emoji: '🔍', text: 'Checking...', color: 'text-gray-600' }
    }
    
    const config = statusConfig[connectionStatus]
    
    return (
      <div className={`flex items-center gap-2 ${config.color}`}>
        <span>{config.emoji}</span>
        <span className="text-sm">{config.text}</span>
        {lastUpdate && connectionStatus === 'online' && (
          <span className="text-xs text-gray-500">({lastUpdate} 更新)</span>
        )}
      </div>
    )
  }

  // 🎯 渲染错误状态
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Something Went Wrong</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  🔄 Retry Loading
                </button>
                
                <button
                  onClick={handleClearCache}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  🗑️ Clear Cache & Retry
                </button>
                
                <a
                  href="/debug"
                  className="px-6 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                >
                  🔧 Run Diagnostics
                </a>
              </div>
              
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Tip:</strong> 
                  If the problem persists, check your network connection or contact support.
                  Error details have been logged to the console.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 🎯 渲染加载状态
  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Amazon AI Image Tools</h1>
            {renderConnectionStatus()}
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
              <p className="text-gray-600">
                {retryCount > 0 ? `Retrying (${retryCount}/3)` : 'Fetching latest data'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 🎯 渲染正常Dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 顶部状态栏 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Amazon AI Image Tools</h1>
            <p className="text-gray-600">Professional AI image processing for Amazon sellers</p>
          </div>
          
          <div className="flex items-center gap-4">
            {renderConnectionStatus()}
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user.email}</p>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 用户数据展示 */}
        {userData && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-2">Account Status</h3>
              <p className="text-2xl font-bold text-green-600">Active</p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-2">Images Processed</h3>
              <p className="text-2xl font-bold text-blue-600">
                {userData.processed_count || 0}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-2">Subscription</h3>
              <p className="text-2xl font-bold text-purple-600">
                {userData.subscription || 'Free Plan'}
              </p>
            </div>
          </div>
        )}

        {/* 主要功能区域 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 标签页 */}
          <div className="border-b">
            <nav className="flex">
              {['background', 'watermark', 'upscale', 'compliance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as any)}
                  className={`px-6 py-4 font-medium text-sm transition ${
                    selectedTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'background' && 'Background Remover'}
                  {tab === 'watermark' && 'Watermark Remover'}
                  {tab === 'upscale' && 'Image Upscale'}
                  {tab === 'compliance' && 'Compliance Check'}
                </button>
              ))}
            </nav>
          </div>

          {/* 内容区域 */}
          <div className="p-8">
            {/* 文件上传区域 */}
            <div className="mb-8">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <div className="text-5xl mb-4">📸</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Upload Amazon Product Images
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Supports JPG, PNG formats, up to 10MB. AI will automatically optimize images for Amazon requirements.
                </p>
                
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(Array.from(e.target.files))
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                />
                
                <label
                  htmlFor="file-upload"
                  className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                >
                  Select Image Files
                </label>
                
                {files.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-2">
                      {files.length} file(s) selected
                    </p>
                    <button
                      onClick={() => setProcessing(true)}
                      disabled={processing}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {processing ? 'Processing...' : 'Start AI Processing'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Debug Information (development only) */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  Debug Information
                </summary>
                <div className="mt-2 space-y-1">
                  <p><strong>Connection:</strong> {connectionStatus}</p>
                  <p><strong>Retry Count:</strong> {retryCount}</p>
                  <p><strong>Last Update:</strong> {lastUpdate || 'None'}</p>
                  <p><strong>Cache Status:</strong> {loadFromCache() ? 'Valid' : 'Invalid/Expired'}</p>
                  <button
                    onClick={handleClearCache}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear Cache
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Having issues? Visit the <a href="/debug" className="text-blue-600 hover:underline">debug page</a> or contact support
          </p>
        </div>
      </div>
    </div>
  )
}