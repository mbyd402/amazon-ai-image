'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

// 🎯 Smart caching system - 10 minute cache
const CACHE_KEY = 'amazon_ai_dashboard_cache'
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// 🔧 Connection status type
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

  // 🎯 Create Supabase client
  const supabase = createClient()

  // 🎯 Smart caching system
  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null
      
      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp
      
      if (age < CACHE_DURATION) {
        console.log(`📦 Using cached data (${Math.round(age/1000)}s ago)`)
        return data
      }
      console.log('📦 Cache expired, re-fetching')
      return null
    } catch (err) {
      console.error('📦 Failed to load cache:', err)
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
      console.log('📦 Data cached')
    } catch (err) {
      console.error('📦 Failed to save cache:', err)
    }
  }

  // 🎯 Check connection status
  const checkConnection = async () => {
    setConnectionStatus('checking')
    
    try {
      const startTime = Date.now()
      const { data, error } = await supabase.auth.getSession()
      const responseTime = Date.now() - startTime
      
      if (responseTime > 5000) {
        setConnectionStatus('slow')
        console.warn(`⚠️ Slow connection: ${responseTime}ms`)
      } else if (error) {
        setConnectionStatus('offline')
        console.error('❌ Connection failed:', error.message)
      } else {
        setConnectionStatus('online')
        console.log(`✅ Connection OK: ${responseTime}ms`)
      }
    } catch (err) {
      setConnectionStatus('offline')
      console.error('❌ Connection check failed:', err)
    }
  }

  // 🎯 Load user data with smart retry
  const loadUserData = async (useCache = true) => {
    setLoading(true)
    setError(null)
    
    try {
      // 1. Try loading from cache
      if (useCache) {
        const cachedData = loadFromCache()
        if (cachedData) {
          setUserData(cachedData)
          setLastUpdate('From cache')
          setLoading(false)
          
          // Background update
          setTimeout(() => loadUserData(false), 1000)
          return
        }
      }

      // 2. Check user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error(`Auth failed: ${sessionError.message}`)
      }
      
      if (!sessionData.session) {
        setUser(null)
        setUserData(null)
        setLoading(false)
        return
      }
      
      setUser(sessionData.session.user)
      
      // 3. Get user data (with 30s timeout)
      console.log(`🔍 Starting to fetch user data: ${sessionData.session.user.id}`)
      const startTime = Date.now()
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          const elapsed = Date.now() - startTime
          console.error(`⏱️ User data request timeout: ${elapsed}ms`)
          reject(new Error(`Request timeout (${elapsed}ms). Please check your ad blocker or try again.`))
        }, 30000)
      )
      
      const userDataPromise = supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single()
      
      const userData = await Promise.race([userDataPromise, timeoutPromise]) as any
      
      if (userData.error) {
        throw new Error(`Failed to fetch data: ${userData.error.message}`)
      }
      
      // 4. Success
      setUserData(userData.data)
      saveToCache(userData.data)
      setLastUpdate(new Date().toLocaleTimeString())
      setRetryCount(0)
      setConnectionStatus('online')
      
    } catch (err: any) {
      const errorDetails = {
        message: err.message,
        type: err.constructor.name,
        timestamp: new Date().toISOString(),
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not configured',
        retryCount,
        connectionStatus
      }
      console.error('❌ Dashboard loading error details:', errorDetails)
      console.error('❌ Original error:', err)
      setError(`${err.message} (retry ${retryCount}/3)`)
      setConnectionStatus('offline')
      
      // Smart retry logic
      if (retryCount < 3) {
        const delay = Math.min(3000, 1000 * (retryCount + 1))
        console.log(`🔄 Retrying in ${delay}ms (${retryCount + 1}/3)`)
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          loadUserData(false)
        }, delay)
      }
    } finally {
      setLoading(false)
    }
  }

  // 🎯 Initialize loading
  useEffect(() => {
    console.log('🚀 Optimized dashboard starting...')
    checkConnection()
    loadUserData(true)
    
    // Periodic connection check
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  // 🚨 Timeout: if still loading after 10 seconds, show error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.error('⏱️ Loading timeout after 10 seconds')
        setError('Loading timeout. Please refresh the page and try again.')
        setLoading(false)
      }
    }, 10000)
    return () => clearTimeout(timer)
  }, [loading])

  // 🎯 Manual retry
  const handleRetry = () => {
    setRetryCount(0)
    loadUserData(false)
  }

  // 🎯 Clear cache and reload
  const handleClearCache = () => {
    localStorage.removeItem(CACHE_KEY)
    loadUserData(false)
  }

  // 🎯 Render connection status indicator
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
          <span className="text-xs text-gray-500">({lastUpdate} updated)</span>
        )}
      </div>
    )
  }

  // 🎯 Render error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong loading dashboard</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  🔄 Retry
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
                
                <a
                  href="/debug-dashboard"
                  className="px-6 py-3 bg-purple-100 text-purple-800 rounded-lg hover:purple-yellow-200 transition"
                >
                  📊 Dashboard Debug
                </a>
              </div>
              
              {/* Diagnostic info panel */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Diagnostic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Connection:</strong> {connectionStatus}</p>
                    <p><strong>Retry Attempts:</strong> {retryCount}/3</p>
                  </div>
                  <div>
                    <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Not Configured'}</p>
                    <p><strong>Last Error:</strong> {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <details>
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Detailed Error
                    </summary>
                    <div className="mt-2 p-3 bg-gray-800 text-gray-100 rounded font-mono text-xs overflow-auto">
                      {JSON.stringify({
                        error: error,
                        connectionStatus,
                        retryCount,
                        timestamp: new Date().toISOString(),
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
                        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
                      }, null, 2)}
                    </div>
                  </details>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Debug Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>1. Click "Dashboard Debug" for detailed diagnostics</li>
                  <li>2. Check browser console (F12) for network requests</li>
                  <li>3. Ensure Supabase environment variables are configured correctly</li>
                  <li>4. Check your internet connection and firewall settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 🎯 Render loading state
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
                {retryCount > 0 ? `Retrying (${retryCount}/3)` : 'Getting latest data'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 🚨 Emergency fallback mode: when Supabase is completely down
  const renderEmergencyMode = () => {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Amazon AI Image Tools</h1>
            <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg">
              🔴 Offline Mode
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Service temporarily unavailable</h2>
              <p className="text-gray-600 mb-4">
                Database connection timeout. You can still use basic features.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Refresh Page
                </button>
                <a
                  href="/login"
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Log In Again
                </a>
                <a
                  href="/debug"
                  className="px-6 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                >
                  🔧 Run Diagnostics
                </a>
              </div>
            </div>
            
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Error Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-mono text-gray-700">{error}</p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Retry Count:</strong> {retryCount} | <strong>Status:</strong> {connectionStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 🚨 Check if emergency mode needed
  if (error && retryCount >= 3) {
    return renderEmergencyMode()
  }

  // 🎯 Render normal dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top status bar */}
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
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User data summary */}
        {userData && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-2">Account Status</h3>
              <p className="text-2xl font-bold text-green-600">Active</p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-2">Remaining Images</h3>
              <p className="text-2xl font-bold text-blue-600">
                {userData.remaining_points || 0}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-2">Membership</h3>
              <p className="text-2xl font-bold text-purple-600">
                {userData.subscription_tier || 'Free Tier'}
              </p>
            </div>
          </div>
        )}

        {/* Main functionality area */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs */}
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
                  {tab === 'background' && 'Background Remove'}
                  {tab === 'watermark' && 'Watermark Remove'}
                  {tab === 'upscale' && 'Upscale & Enhance'}
                  {tab === 'compliance' && 'Compliance Check'}
                </button>
              ))}
            </nav>
          </div>

          {/* Content area */}
          <div className="p-8">
            {/* File upload area */}
            <div className="mb-8">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <div className="text-5xl mb-4">📸</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Upload Amazon Product Image
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Supports JPG, PNG up to 10MB. AI will automatically optimize image for Amazon requirements.
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

            {/* Debug info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  Debug Information
                </summary>
                <div className="mt-2 space-y-1">
                  <p><strong>Connection Status:</strong> {connectionStatus}</p>
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
            Having issues? Visit the <a href="/debug" className="text-blue-600 hover:underline">diagnostics page</a> or contact support
          </p>
        </div>
      </div>
    </div>
  )
}
