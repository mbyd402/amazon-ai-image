'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PACKAGES } from '@/lib/config'
import Image from 'next/image'
import ProcessPage from '@/components/ProcessPage'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'background' | 'watermark' | 'upscale' | 'compliance'>('background')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add 10 second timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        })

        const userPromise = supabase.auth.getUser()
        const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any
        
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)
        
        const { data } = await Promise.race([
          supabase
            .from('users')
            .select('remaining_points, total_points')
            .eq('id', user.id)
            .single(),
          timeoutPromise
        ]) as any
        
        setUserData(data)
        setLoading(false)
      } catch (err) {
        console.error('Dashboard loading error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
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
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg inline-block">
              <p className="text-red-600 dark:text-red-400 mb-4">Loading failed: {error}</p>
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
