'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { PACKAGES } from '@/lib/config'

// 🎯 Smart caching system - 10 minute cache
const CACHE_KEY = 'amazon_ai_dashboard_cache'
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// 🔧 Connection status type
type ConnectionStatus = 'online' | 'offline' | 'slow' | 'checking'

export default function OptimizedDashboard() {
  console.log('🚀 Starting OptimizedDashboard render...')

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
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // Create client ONCE - use ref to avoid recreation on every render
  const isInitialized = useRef(false)
  const supabase = useRef<any>(null)

  // Initialize everything ONCE
  useEffect(() => {
    // Prevent multiple initializations (React Strict Mode fix)
    if (isInitialized.current) {
      return
    }
    isInitialized.current = true

    console.log('🔧 Initializing dashboard...')
    
    // 1. Create supabase client ONCE
    try {
      console.log('🔧 Creating Supabase client...')
      supabase.current = createClient()
      console.log('✅ Supabase client created:', !!supabase.current)
    } catch (err: any) {
      console.error('❌ Failed to create client:', err)
      setError(`Failed to initialize: ${err.message}`)
      return
    }

    const client = supabase.current

    // 2. Check connection
    const checkConnection = async () => {
      if (!client) return
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

    // Wait a tiny bit to avoid race conditions
    setTimeout(() => {
      checkConnection()
    }, 100)
    
    // 3. Listen for auth state changes
    const authChangeResult = client.auth.onAuthStateChange((event: string, session: any) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email)
      
      if (session?.user) {
        console.log('✅ Session ready for user:', session.user.email)
        setUser(session.user)
        // Load user data after a short delay to ensure state is updated
        setTimeout(() => {
          loadUserData(client, true)
        }, 100)
      }
    })
    console.log('✅ Auth listener registered')
    
    // Safely get subscription - different supabase versions return different formats
    const subscription = authChangeResult?.data?.subscription || authChangeResult?.subscription

    // 4. Try loading immediately
    setTimeout(() => {
      loadUserData(client, true)
    }, 200)
    console.log('✅ Initial load started')
    
    // 5. Periodic connection check
    const interval = setInterval(checkConnection, 30000)
    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe()
      }
      clearInterval(interval)
      isInitialized.current = false
    }
  }, [])

  // 🎯 Load user data (smart retry with cache)
  const loadUserData = async (client: any, useCache = true, attempt = 0) => {
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
          setTimeout(() => loadUserData(client, false), 1000)
          return
        }
        console.log('📦 No valid cache, fetching from server')
      }

      // 2. Check user session
      console.log('🔍 Checking user session...')

      // Wait a bit for PKCE/OAuth to complete if needed
      if (attempt === 0) {
        console.log('⏳ Waiting 500ms for session initialization...')
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      const { data: sessionData, error: sessionError } = await client.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError.message)
        throw new Error(`Auth failed: ${sessionError.message}`)
      }
      
      if (!sessionData.session) {
        console.log('⚠️ No session found, attempt:', attempt)
        // If we haven't retried too many times, retry
        if (attempt < 3) {
          console.log('🔄 Retrying...')
          setTimeout(() => {
            loadUserData(client, useCache, attempt + 1)
          }, 800)
          return
        }
        console.log('❌ No session after multiple retries - redirecting to login')
        window.location.href = '/login'
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
      
      const userDataPromise = client
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      const userDataResult = await Promise.race([userDataPromise, timeoutPromise]) as any
      
      // 4. If user doesn't exist in users table, create it automatically
      if (userDataResult.error && userDataResult.error.code === 'PGRST116') {
        console.log('🔍 User not found in users table, creating new record...')
        
        const { error: createError } = await client.from('users').insert({
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
        const { data: newUserData } = await client
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
          loadUserData(client, useCache, attempt + 1)
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

  // If still initializing client
  if (!supabase.current) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-500">Initializing...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If no user after initialization, redirect to login
  if (!loading && !user) {
    console.log('🔒 No user logged in, redirecting to login page')
    window.location.href = '/login'
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-500">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If error
  if (error && !loading && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800">Error</h3>
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
              <p className="text-gray-500">Professional image processing for Amazon sellers</p>
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
            <p className="text-gray-600">Professional image processing for Amazon sellers</p>
          </div>
          {renderConnectionStatus()}
          
          {user && supabase.current && (
            <div className="flex items-center gap-4">
              {userData && (
                <div className="text-sm">
                  <span className="text-gray-500">Points: </span>
                  <span className="font-semibold text-gray-800">
                    {userData.remaining_points}
                  </span>
                </div>
              )}
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{user.email}</p>
                <button
                  onClick={() => supabase.current.auth.signOut().then(() => window.location.href = '/login')}
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
                    const newFiles = Array.from(e.target.files)
                    // Check for duplicate files by name
                    const existingNames = files.map(f => f.name)
                    const duplicates = newFiles.filter(f => existingNames.includes(f.name))
                    if (duplicates.length > 0) {
                      alert(`The following ${duplicates.length} file(s) have already been added:\n${duplicates.map(f => f.name).join('\n')}\n\nSkipped duplicates.`)
                    }
                    // Filter out duplicates
                    const uniqueNewFiles = newFiles.filter(f => !existingNames.includes(f.name))
                    // Limit to maximum 5 files
                    const combined = [...files, ...uniqueNewFiles].slice(0, 5)
                    setFiles(combined)
                    // Clear the input value so the same file can be selected again if needed
                    e.target.value = ''
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
                  <p className="text-sm text-gray-600 mb-4">
                    {files.length} / 5 file(s) selected
                  </p>
                  
                  {/* Image preview grid */}
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                    {files.map((file, index) => {
                      const url = URL.createObjectURL(file)
                      return (
                        <div key={index} className="relative rounded overflow-hidden shadow cursor-pointer" onClick={() => setPreviewImage(url)}>
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover hover:opacity-80 transition"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                            {file.name}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setFiles(files.filter((_, i) => i !== index))
                            }}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                    {/* Add more button if less than 5 */}
                    {files.length < 5 && (
                      <label
                        htmlFor="file-upload"
                        className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-blue-500 transition"
                      >
                        <span className="text-3xl text-gray-400">+</span>
                      </label>
                    )}
                  </div>

                  <button
                    onClick={async () => {
                      if (!supabase.current || !user) {
                        alert('Please wait for initialization or login again')
                        return
                      }
                      if (files.length === 0) {
                        alert('Please select at least one image to process')
                        return
                      }
                      // Check if user has enough points
                      if (userData && userData.remaining_points < files.length) {
                        alert(`You don't have enough points. You need ${files.length} points, but you only have ${userData.remaining_points}.`)
                        return
                      }
                      setProcessing(true)
                      setResults([])
                      
                      try {
                        const processedResults: string[] = []
                        const client = supabase.current
                        
                        // Process each file one by one via API
                        for (const file of files) {
                          console.log('Processing:', file.name, 'type:', selectedTab)
                          
                          // Create form data for upload
                          const formData = new FormData()
                          formData.append('image', file)
                          formData.append('operation', selectedTab)
                          formData.append('userId', user.id)
                          // API expects user_id, not userId
                          formData.append('user_id', user.id)
                          
                          // Call processing API
                          const response = await fetch('/api/process', {
                            method: 'POST',
                            body: formData,
                          })
                          
                          if (!response.ok) {
                            const error = await response.text()
                            throw new Error(`Processing failed: ${response.status} ${error}`)
                          }
                          
                          const data = await response.json()
                          if (data.success && data.results && data.results.length > 0) {
                            processedResults.push(...data.results)
                            console.log('Processing successful:', data.results)
                          } else if (data.success && data.processedUrl) {
                            processedResults.push(data.processedUrl)
                            console.log('Processing successful:', data.processedUrl)
                          } else {
                            throw new Error(data.error || 'Processing failed')
                          }
                          
                          // Small delay between requests
                          await new Promise(resolve => setTimeout(resolve, 500))
                        }
                        
                        setResults(processedResults)
                        
                        // API already deducts points on server side, just refresh user data
                        if (userData && user) {
                          const { data: result } = await client
                            .from('users')
                            .select('remaining_points, total_points')
                            .eq('id', user.id)
                          console.log('Refreshed user data after processing:', result)
                          if (result && result.length > 0) {
                            // Keep existing processed_count if we have it
                            setUserData({
                              ...userData,
                              ...result[0]
                            })
                            saveToCache({
                              ...userData,
                              ...result[0]
                            })
                            console.log('Points updated:', result[0].remaining_points)
                          }
                        }
                        
                        console.log('Processing complete:', processedResults.length, 'results')
                      } catch (err: any) {
                        console.error('Processing failed:', err)
                        alert(`Processing failed: ${err.message}`)
                      } finally {
                        setProcessing(false)
                      }
                    }}
                    disabled={processing || !supabase.current || !user || files.length === 0}
                    className="px-8 py-3 bg-green-600 text-white text-base font-medium rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : `Start Processing (${files.length} image${files.length > 1 ? 's' : ''})`}
                  </button>
                </div>
              )}
            </div>

            {/* Processing results */}
            {results.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ✅ Processing Complete ({results.length} result{results.length > 1 ? 's' : ''})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map((resultUrl, index) => (
                    <div key={index} className="relative rounded overflow-hidden shadow-lg border cursor-pointer" onClick={() => setPreviewImage(resultUrl)}>
                      <img
                        src={resultUrl}
                        alt={`Processed result ${index + 1}`}
                        className="w-full h-40 object-cover hover:opacity-80 transition"
                      />
                      <div className="p-2 bg-white">
                        <a
                          href={resultUrl}
                          download
                          className="text-xs text-blue-600 hover:underline block text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Download Image
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
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

      {/* Image preview modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={previewImage} 
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
