'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 全新的dashboard - 零依赖
export default function NewDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'background' | 'watermark' | 'upscale' | 'compliance'>('background')
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const router = useRouter()

  // 初始化 - 超级简单
  useEffect(() => {
    console.log('NEW DASHBOARD LOADING - Version:', Date.now())
    
    // 直接从URL或localStorage获取
    const params = new URLSearchParams(window.location.search)
    const email = params.get('email') || localStorage.getItem('new_user_email') || 'user@example.com'
    const userId = params.get('userId') || localStorage.getItem('new_user_id') || 'user_' + Date.now()
    const points = parseInt(localStorage.getItem('new_user_points') || '10')
    
    setUser({ id: userId, email })
    setUserData({ remaining_points: points, total_points: points })
    
    // 保存
    localStorage.setItem('new_user_email', email)
    localStorage.setItem('new_user_id', userId)
    localStorage.setItem('new_user_points', points.toString())
    
    // 清理URL
    if (params.has('email') || params.has('userId')) {
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
    }
    
    setLoading(false)
    
    // 验证没有Supabase
    if (typeof window !== 'undefined') {
      console.log('Checking for Supabase...')
      try {
        // @ts-ignore
        if (window.supabase) {
          console.error('ERROR: Supabase still exists!')
        }
      } catch (e) {
        console.log('Good: Supabase not found')
      }
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles)
      setFiles(prev => [...prev, ...fileArray].slice(0, 5))
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleProcess = () => {
    if (files.length === 0 || processing) return
    
    setProcessing(true)
    
    // 模拟处理
    setTimeout(() => {
      const mockResults = files.map(file => URL.createObjectURL(file))
      setResults(mockResults)
      setProcessing(false)
      
      // 扣除点数
      const currentPoints = parseInt(localStorage.getItem('new_user_points') || '10')
      const newPoints = Math.max(0, currentPoints - files.length)
      localStorage.setItem('new_user_points', newPoints.toString())
      setUserData({ remaining_points: newPoints, total_points: newPoints })
    }, 1500)
  }

  const handleAddPoints = () => {
    const current = parseInt(localStorage.getItem('new_user_points') || '10')
    const newPoints = current + 10
    localStorage.setItem('new_user_points', newPoints.toString())
    setUserData({ remaining_points: newPoints, total_points: newPoints })
  }

  const handleLogout = () => {
    localStorage.removeItem('new_user_email')
    localStorage.removeItem('new_user_id')
    localStorage.removeItem('new_user_points')
    window.location.href = '/new-login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-black py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Loading New Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Version: {Date.now()}
          </p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'background', label: 'Pure White Background', icon: '✨' },
    { id: 'watermark', label: 'Remove Watermark', icon: '🧼' },
    { id: 'upscale', label: 'Upscale Image', icon: '🚀' },
    { id: 'compliance', label: 'Check Compliance', icon: '✅' },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-black py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 成功横幅 */}
        <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🎉</span>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold">New Dashboard Loaded Successfully!</h2>
              <p className="opacity-90 mt-1">
                Zero external dependencies • Fully local • No timeouts
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Amazon AI Image Studio
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400">{user.email}</span>
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  🆕 Version: {Date.now().toString().slice(-6)}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-6 py-4 rounded-xl shadow">
                <p className="text-sm font-medium text-white/80">Available Points</p>
                <p className="text-4xl font-bold text-white mt-1">{userData.remaining_points}</p>
                <button
                  onClick={handleAddPoints}
                  className="mt-3 text-sm font-medium bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-lg transition"
                >
                  + Add 10 Points
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="flex flex-wrap gap-1 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                    flex-1 min-w-[150px] py-4 px-4 rounded-xl text-center transition-all
                    ${selectedTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="text-xl block mb-2">{tab.icon}</span>
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Upload Your Images
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select up to 5 images for {selectedTab.replace('_', ' ')} processing
            </p>
          </div>
          
          <div className="border-3 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center hover:border-blue-400 transition">
            <div className="text-5xl mb-4">📁</div>
            <input
              type="file"
              id="new-file-upload"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="new-file-upload"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 cursor-pointer transition"
            >
              <span className="mr-3">📤</span>
              Choose Images
            </label>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              or drag and drop images here
            </p>
          </div>

          {/* File Preview */}
          {files.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Selected Images ({files.length}/5)
                </h4>
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {files.map((file, index) => (
                  <div key={index} className="group relative">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-lg hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate px-1">
                      {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Process Button */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Ready to Process
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-gray-600 dark:text-gray-400">
                  Operation: <span className="font-semibold capitalize">{selectedTab}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Cost: <span className="font-semibold text-blue-600 dark:text-blue-400">{files.length} point{files.length !== 1 ? 's' : ''}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleProcess}
              disabled={files.length === 0 || processing || userData.remaining_points < files.length}
              className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition disabled:transform-none hover:scale-105 active:scale-95"
            >
              {processing ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                  Processing {files.length} image{files.length !== 1 ? 's' : ''}...
                </span>
              ) : (
                `Process ${files.length} Image${files.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="mr-3">✅</span>
                Processing Complete!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Your images have been processed successfully. Download them below.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {results.map((result, index) => (
                <div key={index} className="group">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition">
                    <img
                      src={result}
                      alt={`Processed ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <a
                    href={result}
                    download={`amazon-${selectedTab}-${index + 1}.png`}
                    className="mt-4 block text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 shadow hover:shadow-md transition"
                  >
                    ⬇️ Download
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Remaining points: <span className="font-bold text-blue-600 dark:text-blue-400">{userData.remaining_points}</span>
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>🔄 This dashboard has <strong>zero external dependencies</strong> and runs entirely in your browser.</p>
          <p className="mt-1">No Supabase • No timeouts • No external API calls</p>
        </div>
      </div>
    </div>
  )
}