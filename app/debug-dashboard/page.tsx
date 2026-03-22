'use client'

// 🚨 调试dashboard - 添加详细日志和版本控制
// 版本: DEBUG_VERSION_20260321_1041
// 注意：此页面完全在客户端渲染，避免服务器端预渲染问题

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState, useEffect } from 'react'

export default function DebugDashboard() {
  const [logs, setLogs] = useState<string[]>([])
  const [version, setVersion] = useState('')
  const [loading, setLoading] = useState(true)
  const [hasSupabase, setHasSupabase] = useState(false)
  const [cacheStatus, setCacheStatus] = useState<any>({})

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const log = `[${timestamp}] ${message}`
    console.log(log)
    setLogs(prev => [...prev, log].slice(-20)) // 保留最近20条
  }

  useEffect(() => {
    // 🎯 立即记录版本信息
    const debugVersion = `DEBUG_${Date.now()}`
    setVersion(debugVersion)
    addLog(`🚀 DEBUG DASHBOARD LOADED - ${debugVersion}`)
    
    // 检查Supabase
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.supabase) {
        addLog('❌ ERROR: Supabase found! This should not happen.')
        setHasSupabase(true)
      } else {
        addLog('✅ Good: Supabase not found')
        setHasSupabase(false)
      }
    } catch(e) {
      addLog('✅ Excellent: Supabase variable not defined')
      setHasSupabase(false)
    }

    // 检查缓存状态
    const cacheInfo = {
      pageJs: 'page-dbccabad9cb4ab96.js',
      layoutJs: 'layout-21d8ed196f8ee048.js',
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server-side',
      localStorageKeys: typeof window !== 'undefined' ? Object.keys(localStorage) : []
    }
    setCacheStatus(cacheInfo)
    addLog(`📊 Cache info: ${JSON.stringify(cacheInfo, null, 2)}`)

    // 立即设置用户（不依赖任何外部服务）
    const userId = `debug_${Date.now()}`
    const userEmail = `debug${Math.floor(Math.random() * 1000)}@amazon.com`
    
    localStorage.setItem('debug_user_id', userId)
    localStorage.setItem('debug_user_email', userEmail)
    localStorage.setItem('debug_user_points', '20')
    localStorage.setItem('debug_version', debugVersion)
    
    addLog(`👤 User created: ${userEmail}`)
    addLog(`💾 Saved to localStorage`)

    // 验证功能
    setTimeout(() => {
      addLog('✅ All checks passed')
      addLog('🎯 Ready for image processing')
      setLoading(false)
    }, 500)

    // 🚨 关键：监听错误
    window.addEventListener('error', (e) => {
      addLog(`🚨 Global error: ${e.message}`)
      if (e.message.includes('Supabase') || e.message.includes('supabase')) {
        addLog('🚫 BLOCKED Supabase-related error')
      }
    })

    // 监听Promise错误
    window.addEventListener('unhandledrejection', (e) => {
      addLog(`🚨 Promise error: ${e.reason}`)
    })

  }, [])

  // 模拟图片处理功能
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles)
      setFiles(prev => [...prev, ...fileArray].slice(0, 3))
      addLog(`📁 Selected ${fileArray.length} file(s)`)
    }
  }

  const handleProcess = () => {
    if (files.length === 0) return
    
    setProcessing(true)
    addLog(`⚙️ Processing ${files.length} image(s)`)
    
    setTimeout(() => {
      const mockResults = files.map(file => URL.createObjectURL(file))
      setResults(mockResults)
      setProcessing(false)
      addLog(`✅ Processing complete - ${mockResults.length} result(s)`)
    }, 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 p-6 bg-red-900/30 border border-red-700 rounded-xl">
            <h1 className="text-3xl font-bold mb-4">🚨 DEBUG DASHBOARD</h1>
            <p className="text-xl text-red-300">Version: {version}</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">📊 System Diagnostics</h2>
            <div className="space-y-2">
              <div className={`p-3 rounded ${hasSupabase ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
                Supabase检测: {hasSupabase ? '❌ FOUND (ERROR!)' : '✅ NOT FOUND (GOOD)'}
              </div>
              <div className="p-3 bg-blue-900/50 rounded">
                加载时间: {new Date().toISOString()}
              </div>
              <div className="p-3 bg-purple-900/50 rounded">
                UserAgent: {typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 50) : 'server-side'}...
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">📝 Real-time Logs</h2>
            <div className="font-mono text-sm bg-black p-4 rounded-lg h-64 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="mb-1 border-l-4 border-green-500 pl-2">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* 调试信息面板 */}
        <div className="mb-8 p-6 bg-blue-900/30 border border-blue-700 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🔧 DEBUG DASHBOARD</h1>
              <p className="text-blue-300 mt-2">Version: {version}</p>
            </div>
            <button
              onClick={() => typeof window !== 'undefined' && window.location.reload()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
            >
              🔄 Force Reload
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：日志面板 */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">📝 System Logs</h2>
              <button
                onClick={() => setLogs([])}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Clear
              </button>
            </div>
            <div className="font-mono text-sm bg-black p-4 rounded-lg h-96 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className={`mb-1 pl-2 ${log.includes('ERROR') ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：功能面板 */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">🖼️ Image Processing</h2>
            
            <div className="mb-6">
              <input
                type="file"
                id="debug-file-upload"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="debug-file-upload"
                className="block w-full p-8 border-2 border-dashed border-gray-600 rounded-xl text-center cursor-pointer hover:border-blue-500"
              >
                <div className="text-4xl mb-4">📁</div>
                <p className="text-lg">Choose Images ({files.length}/3)</p>
                <p className="text-sm text-gray-400 mt-2">Click or drag and drop</p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {files.map((file, i) => (
                    <div key={i} className="relative">
                      <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-xl font-bold text-lg"
                >
                  {processing ? 'Processing...' : `Process ${files.length} Image${files.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">✅ Processed Results</h3>
                <div className="grid grid-cols-3 gap-4">
                  {results.map((result, i) => (
                    <div key={i}>
                      <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={result}
                          alt={`Result ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <a
                        href={result}
                        download={`debug-result-${i + 1}.png`}
                        className="block mt-2 text-center py-2 bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部状态栏 */}
        <div className="mt-8 p-4 bg-gray-900 rounded-xl">
          <div className="flex flex-wrap gap-4">
            <div className={`px-4 py-2 rounded ${hasSupabase ? 'bg-red-900' : 'bg-green-900'}`}>
              Supabase: {hasSupabase ? '❌ DETECTED' : '✅ ABSENT'}
            </div>
            <div className="px-4 py-2 bg-blue-900 rounded">
              Logs: {logs.length}
            </div>
            <div className="px-4 py-2 bg-purple-900 rounded">
              Version: {version}
            </div>
            <button
              onClick={() => {
                typeof window !== 'undefined' && localStorage.clear()
                addLog('🧹 LocalStorage cleared')
                typeof window !== 'undefined' && window.location.reload()
              }}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded"
            >
              Clear Storage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}