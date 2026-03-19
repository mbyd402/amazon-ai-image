'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase.ts'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('remaining_points, total_points')
          .eq('id', user.id)
        setUserData(data?.[0] || null)
        console.log('User data loaded:', data)
      } else {
        setUserData(null)
      }
      setLoading(false)
    }

    getCurrentUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase
          .from('users')
          .select('remaining_points, total_points')
          .eq('id', session.user.id)
        setUserData(data?.[0] || null)
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  if (loading) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                Amazon AI Image
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              Amazon AI Image
            </Link>
            {user && (
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-white'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/history"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/history')
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-white'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  History
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {userData && (
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Points: </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userData.remaining_points}
                </span>
              </div>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
