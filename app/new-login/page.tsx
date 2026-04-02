'use client'

import { useState } from 'react'

export default function NewLogin() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // 立即重定向，不需要网络请求
    setTimeout(() => {
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
      window.location.href = `/new-dashboard?email=${encodeURIComponent(email)}&userId=${userId}`
    }, 300)
  }

  const handleGoogleLogin = () => {
    setLoading(true)
    
    // 模拟Google OAuth
    setTimeout(() => {
      const mockEmail = `user${Math.floor(Math.random() * 10000)}@gmail.com`
      const userId = 'google_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8)
      window.location.href = `/new-dashboard?email=${encodeURIComponent(mockEmail)}&userId=${userId}`
    }, 300)
  }

  const handleDemoLogin = () => {
    const demoEmail = `demo${Math.floor(Math.random() * 1000)}@amazon-seller.com`
    const userId = 'demo_' + Date.now()
    window.location.href = `/new-dashboard?email=${encodeURIComponent(demoEmail)}&userId=${userId}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <span className="text-3xl text-white">🤖</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Amazon AI Studio
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Next-generation image processing for Amazon sellers
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              ✅ Zero-dependency version • No timeouts
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Get Started
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            Choose your login method
          </p>

          {/* Demo Button (最显眼) */}
          <div className="mb-6">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-70 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-center">
                <span className="mr-3 text-xl">🚀</span>
                Try Instant Demo
              </div>
            </button>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              No signup required • 10 free points
            </p>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or sign in with
              </span>
            </div>
          </div>

          {/* Google Button */}
          <div className="mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-6 border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-70 transition flex items-center justify-center"
            >
              <span className="mr-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </span>
              Google (Demo)
            </button>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="mb-6">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 text-white rounded-xl font-medium hover:from-gray-900 hover:to-black dark:hover:from-gray-800 dark:hover:to-gray-900 disabled:opacity-70 transition"
            >
              {loading ? 'Signing in...' : 'Continue with Email'}
            </button>
          </form>

          {/* Features */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              🎯 What's different about this version:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Zero external dependencies</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>No Supabase connection timeouts</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>All data saved locally in your browser</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>10 free demo points to start</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Full functionality without network calls</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Having issues with the old version?{' '}
              <a 
                href="/local-login" 
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                Try another local version
              </a>
            </p>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Version: new-zero-deps-{Date.now().toString().slice(-6)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}export const runtime = 'edge'
