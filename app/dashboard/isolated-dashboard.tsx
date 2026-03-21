'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 完全独立的组件，不导入任何外部依赖
const IsolatedProcessPage = ({ operation, userId, remainingPoints }: any) => {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles)
      setFiles(prev => [...prev, ...fileArray].slice(0, 5)) // 最多5张
    }
  }

  const handleProcess = async () => {
    if (files.length === 0) return
    
    setProcessing(true)
    
    // 模拟处理过程
    setTimeout(() => {
      const mockResults = files.map(file => {
        return URL.createObjectURL(file) // 实际应用中这里会是处理后的图片
      })
      setResults(mockResults)
      setProcessing(false)
    }, 2000)
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* 上传区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Upload Images ({files.length}/5)
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload up to 5 images for processing
          </p>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Select Images
          </label>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            or drag and drop
          </p>
        </div>

        {/* 文件预览 */}
        {files.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selected Files:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 处理按钮 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Operation: <span className="font-medium capitalize">{operation}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Points required: {files.length} (You have {remainingPoints})
            </p>
          </div>
          <button
            onClick={handleProcess}
            disabled={files.length === 0 || processing || remainingPoints < files.length}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {processing ? 'Processing...' : `Process ${files.length} Image${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

      {/* 结果展示 */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Processed Results
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {results.map((result, index) => (
              <div key={index} className="relative">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={result}
                    alt={`Processed ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <a
                  href={result}
                  download={`processed-${index + 1}.png`}
                  className="mt-2 block text-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function IsolatedDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'background' | 'watermark' | 'upscale' | 'compliance'>('background')
  const router = useRouter()

  useEffect(() => {
    // 超级简单的用户管理
    const initUser = () => {
      // 检查URL参数
      const params = new URLSearchParams(window.location.search)
      const email = params.get('email') || 'demo@user.com'
      const userId = params.get('userId') || 'demo_' + Date.now()
      
      // 检查localStorage
      const storedEmail = localStorage.getItem('isolated_user_email') || email
      const storedId = localStorage.getItem('isolated_user_id') || userId
      const storedPoints = localStorage.getItem('isolated_user_points') || '10'
      
      // 设置用户
      setUser({
        id: storedId,
        email: storedEmail
      })
      setUserData({
        remaining_points: parseInt(storedPoints),
        total_points: parseInt(storedPoints)
      })
      
      // 保存
      localStorage.setItem('isolated_user_email', storedEmail)
      localStorage.setItem('isolated_user_id', storedId)
      localStorage.setItem('isolated_user_points', storedPoints)
      
      // 清理URL
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
      
      setLoading(false)
    }
    
    initUser()
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/local-login'
  }

  const handleAddPoints = () => {
    const current = parseInt(localStorage.getItem('isolated_user_points') || '10')
    const newPoints = current + 10
    localStorage.setItem('isolated_user_points', newPoints.toString())
    setUserData({
      remaining_points: newPoints,
      total_points: newPoints
    })
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

  const tabs = [
    { id: 'background', label: 'AI White Background', icon: '🖼️' },
    { id: 'watermark', label: 'Remove Watermark', icon: '🧹' },
    { id: 'upscale', label: 'Upscale & Enhance', icon: '🚀' },
    { id: 'compliance', label: 'Compliance Check', icon: '✅' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 完全独立模式通知 */}
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-green-600 dark:text-green-400">🔒</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Fully Isolated Mode</strong> - No external dependencies. 
                All features work locally in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Amazon AI Image Tools
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Welcome, {user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Points Available
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userData.remaining_points}
                </p>
                <button
                  onClick={handleAddPoints}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add 10 points
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
        <IsolatedProcessPage 
          operation={selectedTab} 
          userId={user.id} 
          remainingPoints={userData.remaining_points}
        />
      </div>
    </div>
  )
}