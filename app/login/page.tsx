'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Only create client on client side to avoid auth lock conflicts
  const [supabase, setSupabase] = useState<any>(null)
  const router = useRouter()

  // Create client on client side only
  useEffect(() => {
    setSupabase(createClient())
  }, [])

  // Handle OAuth callback when token is in hash (PKCE callback fallback)
  useEffect(() => {
    if (!supabase) return
    
    // Check if we have access_token in hash from PKCE callback
    const handleHashCallback = async () => {
      const hash = window.location.hash
      console.log('🔍 Login page loaded, hash:', hash ? hash.substring(0, 50) + '...' : 'empty')
      
      if (!hash || !hash.includes('access_token')) {
        console.log('No access_token in hash, skipping callback processing')
        return
      }
      
      console.log('✅ Found access_token in hash, processing PKCE callback...')
      
      try {
        // Force Supabase to process the hash
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('📋 Get session result:', { 
          hasSession: !!session, 
          user: session?.user?.email,
          error: error?.message 
        })
        
        if (error) {
          console.error('❌ Get session error from hash:', error)
          setError(error.message)
          return
        }
        
        if (session?.user) {
          console.log('✅ Got session from hash for user:', session.user.email)
          
          // Clear the hash before redirect
          window.location.hash = ''
          
          // Redirect to dashboard
          console.log('🔀 Redirecting to dashboard...')
          window.location.replace('/dashboard')
        }
      } catch (err) {
        console.error('❌ Error processing PKCE callback:', err)
        setError((err as Error).message)
      }
    }
    
    // Wait a bit for everything to initialize
    const timer = setTimeout(() => {
      handleHashCallback()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    
    setLoading(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        setError(authError.message)
        return
      }

      console.log('✅ Email login successful')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!supabase) return
    
    setLoading(true)
    setError('')
    
    console.log('Starting Google login with PKCE flow...')
    
    try {
      // Get current origin correctly - window is only available on client
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amazon-image-pro.vercel.app'
      
      console.log('Redirect URI:', `${origin}/auth/callback`)
      
      // Use PKCE flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`
        }
      })

      console.log('OAuth result error:', error)

      if (error) {
        setError(error.message)
        console.error('OAuth error:', error)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Google login unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your Amazon Image Pro account
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-300">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email-address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !supabase}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading || !supabase}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.35-4.98-1.11-.25-2.15-.72-3.12-1.37v3.58c2.22 0 4.02 1.35 4.78 3.29z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.35 14.29c-.25-.75-.38-1.56-.38-2.29s.13-1.54.38-2.29V6.13c-1.02.61-1.85 1.5-2.47 2.59v11.48c.62 1.09 1.45 1.98 2.47 2.59z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.67 0 3.17.57 4.27 1.7l3.14-3.14C17.46 1.63 14.97 0 12 0 8.69 0 5.74 1.92 3.88 4.66 6.35 7.58 4.75 12 4.75z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export const runtime = 'edge'
