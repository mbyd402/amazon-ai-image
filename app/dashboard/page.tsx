'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

// 🎯 Smart caching system - 10 minute cache
const CACHE_KEY = 'amazon_ai_dashboard_cache'
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// 🔧 Connection status type
type ConnectionStatus = 'online' | 'offline' | 'slow' | 'checking'

// Style constants as requested
const SELECTION_BORDER_COLOR = '#007AFF' // iOS/Apple native blue
const SELECTION_BORDER_WIDTH = 2
const SELECTION_FILL_COLOR = 'rgba(0, 122, 255, 0.20)'

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
  
  // For interactive watermark marking - user draws mask on canvas
  const [markingImage, setMarkingImage] = useState<{
    width: number
    height: number
    imageUrl: string
    naturalWidth: number
    naturalHeight: number
  } | null>(null)
  
  const [markedRects, setMarkedRects] = useState<{x: number, y: number, w: number, h: number}[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({x: 0, y: 0})
  const [currentTempRect, setCurrentTempRect] = useState<{x: number, y: number, w: number, h: number} | null>(null)
  const lastDrawTimeRef = useRef<number>(0)
  
  // Create client ONCE - use ref to avoid recreation on every render
  const isInitialized = useRef(false)
  const supabase = useRef<any>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Keep latest state in refs for redraw (avoids closure issues)
  const markedRectsRef = useRef<{x: number, y: number, w: number, h: number}[]>([])
  const currentTempRectRef = useRef<{x: number, y: number, w: number, h: number} | null>(null)
  const isDrawingRef = useRef(false)

  // Sync refs with state
  markedRectsRef.current = markedRects
  currentTempRectRef.current = currentTempRect
  isDrawingRef.current = isDrawing

  // Redraw all marked rectangles when markedRects changes
  // This ensures all selections are always visible after React re-renders
  const redrawAllSelections = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !imageRef.current.complete) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Clear canvas and redraw original image
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.drawImage(imageRef.current, 0, 0)

    // Draw all saved selections with proper styling - use ref for latest value
    markedRectsRef.current.forEach(rect => {
      // Semi-transparent fill
      ctx.fillStyle = SELECTION_FILL_COLOR
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
      // Blue border
      ctx.strokeStyle = SELECTION_BORDER_COLOR
      ctx.lineWidth = SELECTION_BORDER_WIDTH
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)
    })

    // Draw current temporary selection if we're dragging
    const tempRect = currentTempRectRef.current
    if (tempRect && isDrawingRef.current) {
      ctx.fillStyle = SELECTION_FILL_COLOR
      ctx.fillRect(tempRect.x, tempRect.y, tempRect.w, tempRect.h)
      ctx.strokeStyle = SELECTION_BORDER_COLOR
      ctx.lineWidth = SELECTION_BORDER_WIDTH
      ctx.strokeRect(tempRect.x, tempRect.y, tempRect.w, tempRect.h)
    }
  }, [])

  // Throttled mousemove handler to reduce rendering frequency
  const handleMouseMoveThrottled = useCallback((e: MouseEvent) => {
    if (!isDrawingRef.current || !canvasRef.current || !markingImage || !imageRef.current || !imageRef.current.complete) return

    const now = Date.now()
    // Throttle to ~30fps (about 33ms between renders)
    if (now - lastDrawTimeRef.current < 33) return
    lastDrawTimeRef.current = now

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const scaleX = markingImage.naturalWidth / canvasRect.width
    const scaleY = markingImage.naturalHeight / canvasRect.height
    const currX = (e.clientX - canvasRect.left) * scaleX
    const currY = (e.clientY - canvasRect.top) * scaleY

    const x = Math.min(startPos.x, currX)
    const y = Math.min(startPos.y, currY)
    const w = Math.abs(currX - startPos.x)
    const h = Math.abs(currY - startPos.y)

    setCurrentTempRect({x, y, w, h})
    redrawAllSelections()
  }, [startPos, markingImage, redrawAllSelections])

  // When markedRects or currentTempRect changes, redraw everything
  useEffect(() => {
    redrawAllSelections()
  }, [markedRects, currentTempRect, redrawAllSelections])

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
      setError('Failed to initialize connection: ' + err.message)
      setLoading(false)
      return
    }

    // 2. Check connection quickly
    const checkConnection = async () => {
      setConnectionStatus('checking')
      const start = Date.now()
      
      try {
        const { data: { session }, error: sessionError } = await supabase.current.auth.getSession()
        const duration = Date.now() - start
        
        if (sessionError) {
          console.error('❌ Connection check failed:', sessionError)
          setConnectionStatus(duration > 3000 ? 'slow' : 'offline')
        } else {
          setConnectionStatus(duration > 3000 ? 'slow' : 'online')
          console.log('✅ Connection OK:', duration + 'ms')
        }
      } catch (err) {
        console.error('❌ Connection check exception:', err)
        setConnectionStatus('offline')
      }
    }

    checkConnection()

    // 3. Load user data
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
            setTimeout(() => {
              loadUserData(client, false, attempt + 1)
            }, 500)
            return
          }
          console.log('📦 No valid cache, fetching from server')
        }

        // Wait a bit for PKCE/OAuth to complete if needed
        if (attempt === 0) {
          console.log('⏳ Waiting 500ms for auth...')
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        console.log('🔍 Checking user session...')
        const { data: { session }, error: sessionError } = await supabase.current.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          throw sessionError
        }

        if (!session?.user) {
          console.log('⚠️ No user session, redirecting to login')
          window.location.href = '/login'
          return
        }

        const userId = session.user.id
        console.log('✅ Got user:', userId)
        setUser(session.user)

        // 4. Get user data from database - only select existing columns
        console.log('🔍 Fetching user data from database...')
        const { data: result, error: dbError } = await supabase.current
          .from('users')
          .select('remaining_points, total_points')
          .eq('id', userId)
          .single()

        if (dbError) {
          console.error('❌ Database error:', dbError)
          throw dbError
        }

        console.log('✅ Got user data:', result)
        setUserData(result)
        saveToCache(result)
        setLastUpdate('Updated just now')
        setError(null)
      } catch (err: any) {
        console.error('❌ Loading failed:', err)
        
        // Retry a few times before giving up
        if (attempt < 3) {
          console.log('🔄 Retrying... attempt', attempt + 1)
          setTimeout(() => {
            loadUserData(client, false, attempt + 1)
          }, 800)
        } else {
          setError('Failed to load user data after multiple retries: ' + err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    // 5. Listen for auth changes
    const { data: { subscription } } = supabase.current.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email)
      
      if (session?.user) {
        setUser(session.user)
        loadUserData(supabase.current, false)
      } else {
        setUser(null)
        setUserData(null)
      }
    })

    // Initial load
    loadUserData(supabase.current, true)

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 📦 Cache helpers
  function loadFromCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null
      
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }
      
      return data
    } catch (e) {
      return null
    }
  }

  function saveToCache(data: any) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (e) {
      // ignore
    }
  }

  function renderConnectionStatus() {
    switch (connectionStatus) {
      case 'checking':
        return (
          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
            Checking connection...
          </span>
        )
      case 'online':
        return (
          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
            ✓ Connected
          </span>
        )
      case 'slow':
        return (
          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
            Slow connection
          </span>
        )
      case 'offline':
        return (
          <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
            Offline
          </span>
        )
    }
  }

  // If still initializing client
  if (!supabase.current) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800">Initializing...</h2>
              <p className="text-gray-600 mt-2">Connecting to services...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If still loading user data
  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-gray-600">Professional image processing for Amazon sellers</p>
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

  // If error
  if (error && !loading && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-gray-600">Professional image processing for Amazon sellers</p>
            </div>
            {renderConnectionStatus()}
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-600 mt-1">{error}</p>
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

  // 🎯 Main dashboard render - clean JSX syntax
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
              {user && (
                <div>
                  <p className="text-sm font-medium text-gray-800">{user.email}</p>
                  <button 
                    onClick={() => {
                      supabase.current.auth.signOut().then(() => window.location.href = '/login')
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
          
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
                Supports JPG, PNG up to 10MB. Automatically optimize your images for Amazon.
              </p>
              
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    // For watermark operation, only allow one image (needs marking area)
                    if (selectedTab === 'watermark') {
                      if (e.target.files[0]) {
                        setFiles([e.target.files[0]])
                        // Clear all existing marked rectangles when changing to a new image
                        setMarkedRects([])
                        setCurrentTempRect(null)
                      }
                    } else {
                      // For other operations, allow up to 5 files
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
                    }
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
                    {/* Add more button: only show for non-watermark tabs and less than 5 */}
                    {selectedTab !== 'watermark' && files.length < 5 && (
                      <label
                        htmlFor="file-upload"
                        className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-blue-500 transition"
                      >
                        <span className="text-3xl text-gray-400">+</span>
                      </label>
                    )}
                    {/* For watermark tab, if no file selected, show placeholder */}
                    {selectedTab === 'watermark' && files.length === 0 && (
                      <label
                        htmlFor="file-upload"
                        className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-blue-500 transition col-span-2"
                      >
                        <span className="text-xl text-gray-400">Click to select image</span>
                      </label>
                    )}
                  </div>

                  {/* Watermark marking area - only show for watermark operation and single file */}
                  {selectedTab === 'watermark' && files.length === 1 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        🖌️ Mark Watermark Area
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Click and drag on the image to select the area containing the watermark. You can mark multiple separate areas.
                        Each selected area will be marked with a blue semi-transparent overlay.
                      </p>
                      <div className="relative border border-gray-300 rounded-lg overflow-hidden" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {files[0] && (
                          <>
                            {(() => {
                              // Keep image reference for redraws (stored in ref for useEffect redraw)
                              const img = new Image()
                              imageRef.current = img
                              img.crossOrigin = "anonymous"
                              img.src = URL.createObjectURL(files[0])
                              img.onload = () => {
                                if (canvasRef.current) {
                                  const canvas = canvasRef.current
                                  const ctx = canvas.getContext('2d')
                                  if (ctx) {
                                    canvas.width = img.naturalWidth
                                    canvas.height = img.naturalHeight
                                    setMarkingImage({
                                      width: canvas.width,
                                      height: canvas.height,
                                      imageUrl: URL.createObjectURL(files[0]),
                                      naturalWidth: img.naturalWidth,
                                      naturalHeight: img.naturalHeight,
                                    })
                                    // After image loads, redraw all selections (includes any existing marked rects)
                                    redrawAllSelections()
                                  }
                                }
                              }

                              return (
                                <canvas
                                  ref={canvasRef}
                                  className="cursor-crosshair bg-white"
                                  style={{
                                    display: 'block',
                                    maxWidth: '100%',
                                    height: 'auto',
                                  }}
                                  onMouseDown={(e) => {
                                    if (!markingImage || !canvasRef.current) return

                                    // Get correct canvas-relative coordinates (corrected for display scaling)
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    const scaleX = markingImage.naturalWidth / rect.width
                                    const scaleY = markingImage.naturalHeight / rect.height
                                    const x = (e.clientX - rect.left) * scaleX
                                    const y = (e.clientY - rect.top) * scaleY

                                    // Only start drawing inside canvas bounds
                                    if (x >= 0 && x <= markingImage.naturalWidth && y >= 0 && y <= markingImage.naturalHeight) {
                                      setStartPos({x, y})
                                      setIsDrawing(true)
                                    }
                                  }}
                                  onMouseMove={(e) => {
                                    handleMouseMoveThrottled(e as any)
                                  }}
                                  onMouseUp={(e) => {
                                    if (!isDrawing || !canvasRef.current || !markingImage) return

                                    setIsDrawing(false)
                                    const canvasRect = canvasRef.current.getBoundingClientRect()
                                    const scaleX = markingImage.naturalWidth / canvasRect.width
                                    const scaleY = markingImage.naturalHeight / canvasRect.height
                                    const endX = (e.clientX - canvasRect.left) * scaleX
                                    const endY = (e.clientY - canvasRect.top) * scaleY

                                    const x = Math.min(startPos.x, endX)
                                    const y = Math.min(startPos.y, endY)
                                    const w = Math.abs(endX - startPos.x)
                                    const h = Math.abs(endY - startPos.y)

                                    // Only add if selection is larger than minimum size (filter accidental tiny selections)
                                    if (w > 10 && h > 10) {
                                      const newRects = [...markedRects, {x, y, w, h}]
                                      setMarkedRects(newRects)
                                    }

                                    setCurrentTempRect(null)
                                  }}
                                  onMouseLeave={() => {
                                    // Cancel drawing if mouse leaves canvas
                                    if (isDrawing) {
                                      setIsDrawing(false)
                                      setCurrentTempRect(null)
                                    }
                                  }}
                                />
                              )
                            })()}
                            {markedRects.length === 0 && (
                              <p className="absolute top-2 left-2 text-xs bg-white/80 p-1 rounded text-gray-500">
                                Click and drag to select watermark area
                              </p>
                            )}
                            {markedRects.length > 0 && (
                              <div className="absolute bottom-2 left-2 text-xs bg-green-500/80 text-white p-1 rounded">
                                {markedRects.length} area(s) marked
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            setMarkedRects([])
                            setCurrentTempRect(null)
                            if (canvasRef.current && imageRef.current && imageRef.current.complete) {
                              const ctx = canvasRef.current.getContext('2d')
                              if (ctx) {
                                canvasRef.current.width = imageRef.current.naturalWidth
                                canvasRef.current.height = imageRef.current.naturalHeight
                                ctx.drawImage(imageRef.current, 0, 0)
                              }
                            }
                          }}
                          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                        >
                          Clear All Marks
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Processing button - only show when there are files selected */}
              {files.length > 0 && (
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
                    if (selectedTab === 'watermark' && files.length === 1 && markedRects.length === 0) {
                      alert('Please mark at least one area containing the watermark before processing.')
                      return
                    }
                    if (userData && userData.remaining_points < files.length) {
                      alert(`You don't have enough points. You need ${files.length} points, but you only have ${userData.remaining_points}.`)
                      return
                    }
                    setProcessing(true)
                    setResults([])
                    
                    try {
                      const processedResults: string[] = []
                      const client = supabase.current
                      
                      for (const file of files) {
                        console.log('Processing:', file.name, 'type:', selectedTab)
                        
                        const formData = new FormData()
                        formData.append('image', file)
                        formData.append('operation', selectedTab)
                        formData.append('userId', user.id)
                        formData.append('user_id', user.id)
                        
                        // For watermark with marked areas - convert canvas to mask image
                        // Clipdrop Cleanup API: mask should be WHITE where you want to REMOVE content
                        // So: marked areas = WHITE (to clean/remove), rest = BLACK (keep unchanged)
                        if (selectedTab === 'watermark' && files.length === 1 && canvasRef.current && markedRects.length > 0) {
                          // Create a new canvas for the actual mask
                          const maskCanvas = document.createElement('canvas')
                          maskCanvas.width = markingImage!.naturalWidth
                          maskCanvas.height = markingImage!.naturalHeight
                          const ctx = maskCanvas.getContext('2d')
                          if (ctx) {
                            // Fill entire mask with black (keep everything by default)
                            ctx.fillStyle = 'black'
                            ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)
                            // Fill marked areas with white (to be removed/cleaned by API)
                            ctx.fillStyle = 'white'
                            markedRects.forEach(rect => {
                              ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
                            })
                            // Convert to blob
                            const maskBlob = await new Promise<Blob | null>((resolve) => {
                              maskCanvas.toBlob(resolve, 'image/png')
                            })
                            if (maskBlob) {
                              formData.append('mask', maskBlob, 'mask.png')
                              console.log('Mask created with', markedRects.length, 'marked areas')
                            }
                          }
                        }
                        
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
                        console.log('API response:', data)
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
                      
                      console.log('Setting results:', processedResults)
                      setResults(processedResults)
                      
                      // Refresh user data after processing - API already deducts points on backend
                      if (userData && user) {
                        const { data: result } = await client
                          .from('users')
                          .select('remaining_points, total_points')
                          .eq('id', user.id)
                        console.log('Refreshed user data after processing:', result)
                        if (result && result.length > 0) {
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
                      let errorMsg = 'Processing failed'
                      if (err.message) {
                        errorMsg += `: ${err.message}`
                      }
                      // Try to get more details from response if possible
                      alert(errorMsg)
                    } finally {
                      setProcessing(false)
                    }
                  }}
                  disabled={processing || !supabase.current || !user || files.length === 0}
                  className="px-8 py-3 bg-green-600 text-white text-base font-medium rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                >
                  {processing ? 'Processing...' : `Start Processing (${files.length} image${files.length > 1 ? 's' : ''})`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Processing results - displayed below the upload area */}
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
            Having issues? Visit the <a href="/debug" className="text-blue-600 hover:underline">connection debug page</a> to diagnose connection problems.
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

// Caching utilities
function loadFromCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data
  } catch (e) {
    return null
  }
}

function saveToCache(data: any) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (e) {
    // ignore
  }
}
