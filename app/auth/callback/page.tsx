'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PACKAGES } from '@/lib/config'

// 🔐 PKCE callback done entirely on client-side
// This is required because code_verifier is stored in localStorage
export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Processing OAuth callback...')
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      console.log('🔐 Starting client-side PKCE callback...')
      
      const supabase = createClient()
      console.log('✅ Supabase client created')
      
      // Get the code from URL
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      
      if (!code) {
        console.error('❌ No code found in URL')
        setError('No authorization code found')
        return
      }
      
      console.log('✅ Got code:', code.substring(0, 10) + '...')
      
      try {
        // Exchange code for session - client has access to code_verifier from localStorage
        setStatus('Exchanging code for session...')
        console.log('🔄 Exchanging code for session...')
        
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('❌ Exchange failed:', exchangeError.message)
          setError(`Exchange failed: ${exchangeError.message}`)
          return
        }
        
        if (!data.session) {
          console.error('❌ No session after exchange')
          setError('No session created after exchange')
          return
        }
        
        console.log('✅ Exchange successful! User:', data.session.user.email)
        setStatus(`Hello ${data.session.user.email}, creating your profile...`)
        
        // 🔐 Double guarantee: create user record in database if it doesn't exist
        // We do this client-side now that we have the session (RLS allows it)
        const userId = data.session.user.id
        const userEmail = data.session.user.email!
        
        console.log('🔍 Checking if user exists in users table...')
        
        // Check if user exists
        const { data: existingUser, error: existingError } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single()
          
        if (existingError && existingError.code === 'PGRST116') {
          console.log('🔧 User does not exist, creating new record...')
          setStatus('Creating your account...')
          
          const { error: createError } = await supabase.from('users').insert({
            id: userId,
            email: userEmail,
            remaining_points: PACKAGES.free.points,
            total_points: PACKAGES.free.points,
            created_at: new Date().toISOString(),
          })
          
          if (createError) {
            console.error('❌ Failed to create user record:', createError.message)
            setError(`Failed to create account: ${createError.message}`)
            return
          }
          
          console.log('✅ User record created successfully!')
        } else if (existingError) {
          console.error('❌ Error checking user:', existingError.message)
        } else {
          console.log('✅ User already exists, skipping creation')
        }
        
        // Everything done! Redirect to dashboard
        console.log('✅ All done, redirecting to dashboard...')
        setStatus('Redirecting to dashboard...')
        
        // Clear the URL search params and redirect
        window.location.href = '/dashboard'
      } catch (err: any) {
        console.error('❌ Unexpected error:', err)
        setError(`Unexpected error: ${err.message}`)
      }
    }
    
    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">{status}</h1>
        <p className="text-gray-500">Please wait...</p>
      </div>
    </div>
  )
}
