'use client'

// 🚨 简单登录页面 - 完全绕过Supabase
// 直接重定向到紧急dashboard

import { useState } from 'react'

export default function SimpleLogin() {
  const [loading, setLoading] = useState(false)

  const handleEmergencyLogin = () => {
    setLoading(true)
    
    // 立即重定向到紧急dashboard
    const userId = 'simple_' + Date.now()
    const userEmail = `seller${Math.floor(Math.random() * 1000)}@amazon.com`
    
    localStorage.setItem('emergency_user_id', userId)
    localStorage.setItem('emergency_user_email', userEmail)
    localStorage.setItem('emergency_user_points', '15')
    
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 紧急通知 */}
        <div className="mb-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white text-center">
          <div className="text-4xl mb-4">🚨</div>
          <h2 className="text-2xl font-bold">EMERGENCY ACCESS</h2>
          <p className="mt-2 opacity-90">
            Supabase connection issues detected
          </p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Amazon AI Tools
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Emergency zero-dependency version
            </p>
          </div>

          {/* 紧急登录按钮 */}
          <div className="mb-6">
            <button
              onClick={handleEmergencyLogin}
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-70 transition"
            >
              {loading ? 'Entering...' : '🚀 Enter Emergency Dashboard'}
            </button>
            <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
              No login required • 15 free points
            </p>
          </div>

          {/* 功能列表 */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              ✅ Emergency Version Features:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                <span>Zero external dependencies</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                <span>No Supabase connection timeouts</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                <span>All data saved locally in your browser</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                <span>15 free demo points included</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                <span>Full image processing functionality</span>
              </li>
            </ul>
          </div>

          {/* 版本信息 */}
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Emergency Version: SIMPLE_ZERO_DEPS_{Date.now().toString().slice(-6)}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <a href="/new-login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Try another local version
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}