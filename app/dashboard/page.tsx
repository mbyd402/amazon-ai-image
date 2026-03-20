'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProcessPage from '@/components/ProcessPage'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'background' | 'watermark' | 'upscale' | 'compliance'>('background')
  const router = useRouter()

  const { PACKAGES } = require('@/lib/config');

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout. Please check your ad blocker or try again.')), 20000)
      })

      const userPromise = supabase.auth.getUser()
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any
      
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Check if user exists in our users table
      const { data, error: dbError } = await Promise.race([
        supabase
          .from('users')
          .select('remaining_points, total_points')
          .eq('id', user.id)
          .single(),
        timeoutPromise
      ]) as any
      
      // If user doesn't exist, create it with free points (for OAuth login)
      if (dbError && dbError.code === 'PGRST116') {
        console.log('Creating new user for OAuth login...')
        const { error: insertError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email!,
          remaining_points: PACKAGES.free.points,
          total_points: PACKAGES.free.points,
        })

        if (insertError) {
          console.error('Error creating user:', insertError)
        }

        // Refetch after creating
        const { data: newUserData } = await supabase
          .from('users')
          .select('remaining_points, total_points')
          .eq('id', user.id)
          .single()
        
        setUserData(newUserData)
      } else {
        setUserData(data)
      }
      
      setLoading(false)
      console.log('Dashboard loaded successfully!')
    } catch (err) {
      console.error('Dashboard loading error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }, [router])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRetry = () => {
    setIsRetrying(true)
    loadData().finally(() => setIsRetrying(false))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Loading...
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              If this takes too long, check if your ad blocker is blocking supabase.co
            </p>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isRetrying ? 'Retrying...' : 'Try Now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg inline-block max-w-md">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Loading failed: {error}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This is usually caused by an ad blocker blocking supabase.co.
                <br />
                Try disabling your ad blocker or use incognito mode.
              </p>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userData) {
    return null
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Image Tools Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Welcome back, {user.email}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remaining Points
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {userData.remaining_points}
              </p>
              {userData.remaining_points <= 0 && (
                <a 
                  href="/dashboard/buy" 
                  className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                >
                  Buy more points →
                </a>
              )}
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
        <ProcessPage 
          operation={selectedTab} 
          userId={user.id} 
          remainingPoints={userData.remaining_points}
        />
      </div>
    </div>
  )
}
