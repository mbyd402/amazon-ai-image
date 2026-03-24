'use client'

console.log('🟢 Starting to render OptimizedDashboard component...')

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { PACKAGES } from '@/lib/config'

// 🎯 Smart caching system - 10 minute cache
const CACHE_KEY = 'amazon_ai_dashboard_cache'
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// 🔧 Connection status type
type ConnectionStatus = 'online' | 'offline' | 'slow' | 'checking'

export default function OptimizedDashboard() {
  console.log('🟢 Inside OptimizedDashboard function...')

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
  
  // Create everything in one useEffect - this is the most reliable way
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    console.log('🔧 Starting initialization...')

    // 1. Create supabase client
    let client: ReturnType<typeof createClient> | null = null
    try {
      console.log('🔧 Creating supabase client...')
      client = createClient()
      console.log('✅ Supabase client created successfully:', !!client)
      setSupabase(client)
    } catch (err) {
      console.error('❌ Failed to create supabase client:', err)
      setError(`Failed to initialize Supabase: ${(err as Error).message}`)
      return
    }

    // 2. Check connection
    const checkConnection = async () => {
      setConnectionStatus('checking')
      
      try {
        const startTime = Date.now()
        const { data, error } = await client.auth.getSession()
        const responseTime = Date.now() - startTime
        
        if (responseTime > 5000) {
          setConnectionStatus('slow')
          console.warn(`⚠️ Connection slow: ${responseTime}ms`)
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

    checkConnection()
    
    // 3. Listen for auth state changes
    if (client) {
      const { data: { subscription } } = client.auth.onAuthStateChange((event: string, session: any) => {
        console.log('🔔 Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          console.log('✅ Session ready for user:', session.user.email)
          setUser(session.user)
          // Use setTimeout to ensure state is updated before loading data
          setTimeout(() => {
            loadUserData(client)
          }, 100)
        }
      })
      console.log('✅ Auth listener registered')
      
      // 4. Try loading immediately
      loadUserData(client)
      console.log('✅ Initial loadUserData started')
      
      // 5. Periodic connection check
      const interval = setInterval(checkConnection, 30000)
      return () => {
        subscription.unsubscribe()
        clearInterval(interval)
      }
    }
  }, [])


  // 🎯 Load user data (smart retry with cache)
  const loadUserData = async (useCache = true, attempt = 0) => {
    if (!supabase) {
      console.log('⏳ Cannot loadUserData - supabase client is null')
      return
    }

    console.log('🚀 Starting loadUserData, useCache:', useCache, 'attempt:', attempt)
    setLoading(true)
    setError(null)
    
    try {
      // 1. Try loading from cache
      if (useCache) {
        const cachedData = loadFromCache()
        if (cachedData) {
          console.log('📦 Using cached data')
          setUserData(cachedData)
          setLastUpdate('Loaded from cache')
          setLoading(false)
          
          // Refresh in background
          setTimeout(() => loadUserData(false), 1000)
          return
        }
        console.log('📦 No valid cache, fetching from server')
      }

      // 2. Check user session
      console.log('🔍 Checking user session...')

      // Wait a bit for PKCE to complete initialization (OAuth redirect after callback needs time)
      if (attempt === 0) {
        console.log('⏳ Waiting 1000ms for PKCE session initialization...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError.message)
        throw new Error(`Auth failed: ${sessionError.message}`)
      }
      
      if (!sessionData.session) {
        console.log('⚠️ No session found, attempt:', attempt)
        // If we haven't retried too many times, retry (give PKCE more time)
        if (attempt < 3) {
          console.log('🔄 Retrying...')
          setTimeout(() => {
            loadUserData(useCache, attempt + 1)
          }, 800)
          return
        }
        console.log('❌ No session after multiple retries')
        setUser(null)
        setUserData(null)
        setLoading(false)
        return
      }
      
      const user = sessionData.session.user
      console.log('✅ Got session for user:', user.email)
      setUser(user)
      
      // 3. Get user data from database with timeout
      console.log('🔍 Fetching user data from database...')
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout, check network connection')), 15000)
      )
      
      const userDataPromise = supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      const userDataResult = await Promise.race([userDataPromise, timeoutPromise]) as any
      
      // 4. If user doesn't exist in users table, create it automatically (our fallback)
      if (userDataResult.error && userDataResult.error.code === 'PGRST116') {
        console.log('🔍 User not found in users table, creating new record...')
        
        const { error: createError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email!,
          remaining_points: PACKAGES.free.points,
          total_points: PACKAGES.free.points,
          created_at: new Date().toISOString(),
        })
        
        if (createError) {
          console.error('❌ Error creating user record:', createError.message)
          throw new Error(`Failed to create user profile: ${createError.message}`)
        }
        
        console.log('✅ New user record created successfully in users table')
        
        // Fetch the newly created user data
        const { data: newUserData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (newUserData) {
          setUserData(newUserData)
          saveToCache(newUserData)
          setLastUpdate(new Date().toLocaleTimeString())
          setRetryCount(0)
          setConnectionStatus('online')
        }
      } else if (userDataResult.error) {
        console.error('❌ Error fetching user data:', userDataResult.error.message)
        throw new Error(`Failed to fetch data: ${userDataResult.error.message}`)
      } else {
        // 4. Success - user already exists
        console.log('✅ User data loaded from database')
        setUserData(userDataResult.data)
        saveToCache(userDataResult.data)
        setLastUpdate(new Date().toLocaleTimeString())
        setRetryCount(0)
        setConnectionStatus('online')
      }
    } catch (err: any) {
      console.error('❌ Dashboard load error:', err)
      setError(err.message || 'Failed to load dashboard')
      setConnectionStatus('offline')
      
      // Smart retry logic
      if (retryCount < 3) {
        const delay = Math.min(3000, 1000 * (retryCount + 1))
        console.log('🔄 Retrying...')
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          loadUserData(useCache, attempt + 1)
        }, delay)
      }
    } finally {
      setLoading(false)
    }
  }

  // 🎯 Load from cache
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
      console.log('📦 Cache expired, fetching from server')
      return null
    } catch (err) {
      console.error('📦 Failed to read cache:', err)
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
      console.log('📦 Data cached successfully')
    } catch (err) {
      console.error('📦 Failed to save cache:', err)
    }
  }

  // 🎯 Render connection status indicator
  const renderConnectionStatus = () => {
    const statusConfig = {
      online: { emoji: '✅', text: 'Online', color: 'text-green-600' },
      offline: { emoji: '❌', text: 'Offline', color: 'text-red-600' },
      slow: { emoji: '⚠️', text: 'Slow', color: 'text-yellow-600' },
      checking: { emoji: '🔍', text: 'Checking', color: 'text-gray-600' }
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

  // If still loading client
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900">Amazon AI Image Tools</h1>
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-500">Initializing client...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900">Amazon AI Image Tools</h1>
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800">Initialization Error</h3>
              <p className="text-red-600 mt-2">{error}</p>
            </div>
            <div className="mt-6">
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

  // 🎯 Render loading state
  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Amazon AI Image Tools</h1>
              <p className="text-gray-500">Professional AI image processing for Amazon sellers</p>
            </div>
            {renderConnectionStatus()}
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
              <p className="text-gray-600 mt-2">
                {retryCount > 0 ? `Retrying... (${retryCount}/3)` : 'Getting ready'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 🎯 Main dashboard render
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top status bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Amazon AI Image Tools</h1>
            <p className="text-gray-600">Professional AI image processing for Amazon sellers</p>
          </div>
          {renderConnectionStatus()}
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{user.email}</p>
                <button
                  onClick={() => supabase?.auth.signOut().then(() => window.location.href = '/login')}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User stats */}
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

        {/* Main functionality */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b">
            <nav className="flex">
              {(['background', 'watermark', 'upscale', 'compliance'] as const).map((tab) => {
                const label = {
                  background: 'Background Remover',
                  watermark: 'Watermark Remover',
                  upscale: 'Image Upscale',
                  compliance: 'Compliance Check',
                }[tab]
                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-6 py-4 font-medium text-sm ${
                      selectedTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content area */}
          <div className="p-8">
            {/* File upload area */}
            <div className="mb-8 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Upload Amazon Product Images
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Supports JPG, PNG up to 10MB. AI will automatically optimize your images for Amazon.
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
                className="inline-block px-8 py-3 bg-blue-600 text-white text-base font-medium rounded-xl hover:bg-blue-700 transition cursor-pointer"
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
                    className="px-8 py-3 bg-green-600 text-white text-base font-medium rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Start AI Processing'}
                  </button>
                </div>
              )}
            </div>

            {/* Debug info - only show when development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left">
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Debug Information
                  </summary>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>User ID: {user?.id}</p>
                    <p>User Email: {user?.email}</p>
                    <p>Has user data: {!!userData}</p>
                    {userData && <p>Remaining points: {userData.remaining_points}</p>}
                  </div>
                </details>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                Having issues? Visit the <a href="/debug" className="text-blue-600 hover:underline">debug page</a> to diagnose connection problems.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Having trouble? Check the <a href="/debug" className="text-blue-600 hover:underline">connection debug page</a>
          </p>
        </div>
      </div>
    </div>
  )
}
