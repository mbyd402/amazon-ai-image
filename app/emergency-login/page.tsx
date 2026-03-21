'use client'

// 🚨 紧急登录页面 - 完全不依赖任何外部服务
// 直接重定向到dashboard，避免任何可能的Supabase调用

import { useEffect } from 'react'

export default function EmergencyLogin() {
  useEffect(() => {
    console.log('🚨 EMERGENCY LOGIN LOADED - Redirecting immediately')
    
    // 立即重定向，不等待任何加载
    setTimeout(() => {
      // 生成随机用户
      const userId = 'emergency_' + Date.now()
      const userEmail = `user${Math.floor(Math.random() * 10000)}@amazon-seller.com`
      
      // 直接设置localStorage
      localStorage.setItem('emergency_user_id', userId)
      localStorage.setItem('emergency_user_email', userEmail)
      localStorage.setItem('emergency_user_points', '10')
      
      // 🎯 关键：使用 window.location.replace 避免历史记录
      window.location.replace('/dashboard')
    }, 100)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-6xl mb-6">🚨</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          EMERGENCY LOGIN
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Redirecting to zero-dependency dashboard...
        </p>
        <div className="inline-block bg-red-100 dark:bg-red-900/30 px-6 py-3 rounded-xl">
          <p className="text-sm font-mono text-red-700 dark:text-red-300">
            Version: EMERGENCY_REDIRECT_{Date.now().toString().slice(-6)}
          </p>
        </div>
      </div>
    </div>
  )
}