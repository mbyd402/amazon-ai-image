'use client'

console.log('🎯 SIMPLE DASHBOARD STARTED - this should log first')

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { PACKAGES } from '@/lib/config'

console.log('🎯 AFTER imports - this should log second')

// 🎯 MINIMAL VERSION - just to see what logs
export default function SimpleDashboard() {
  console.log('🎯 INSIDE COMPONENT - this should log third')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])

  const addLog = (msg: string) => {
    console.log(msg)
    setLog(prev => [...prev, msg])
  }

  useEffect(() => {
    addLog('🚀 useEffect starting...')
    
    let client: any
    try {
      addLog('🔧 Creating supabase client...')
      client = createClient()
      addLog(`✅ Client created: ${!!client}`)
      
      addLog('🔍 Checking session...')
      client.auth.getSession().then(({ data, error }: { data: any, error: any }) => {
        addLog(`Session check done - error: ${error?.message || 'none'} - session: ${!!data.session}`)
        
        if (data.session?.user) {
          addLog(`✅ Got user: ${data.session.user.email}`)
          
          // Try to get user data
          addLog('🔍 Checking users table...')
          client.from('users').select('*').eq('id', data.session.user.id).single()
            .then(({ data: userData, error: userError }: { data: any, error: any }) => {
              addLog(`User query done - error: ${userError?.message || 'none'} - code: ${userError?.code}`)
              
              if (userError && userError.code === 'PGRST116') {
                addLog('🔍 User not found, creating...')
                client.from('users').insert({
                  id: data.session.user.id,
                  email: data.session.user.email!,
                  remaining_points: PACKAGES.free.points,
                  total_points: PACKAGES.free.points,
                  created_at: new Date().toISOString(),
                }).then(({ error: createError }: { error: any }) => {
                  if (createError) {
                    addLog(`❌ Create error: ${createError.message} (code: ${createError.code})`)
                    setError(createError.message)
                  } else {
                    addLog('✅ User created successfully in users table!')
                  }
                  setLoading(false)
                }).catch((err: any) => {
                  addLog(`❌ Create failed: ${err.message}`)
                  setError(err.message)
                  setLoading(false)
                })
              } else if (userError) {
                addLog(`❌ Query error: ${userError.message} (code: ${userError.code})`)
                setError(userError.message)
                setLoading(false)
              } else {
                addLog(`✅ User already exists: ${JSON.stringify(userData, null, 2)}`)
                setLoading(false)
              }
            }).catch((err: any) => {
              addLog(`❌ Query failed: ${err.message}`)
              setError(err.message)
              setLoading(false)
            })
        } else {
          addLog('⚠️ No session found - redirecting to login...')
          window.location.href = '/login'
          setLoading(false)
        }
      }).catch((err: any) => {
        addLog(`❌ Unhandled error in getSession: ${err.message}`)
        setError(err.message)
        setLoading(false)
      })
      
    } catch (err: any) {
      addLog(`❌ FATAL ERROR creating client: ${err.message}`)
      setError(err.message)
      setLoading(false)
    }
  }, [])

  console.log('🎯 RENDERING COMPONENT - loading:', loading)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Amazon AI Image - Debug Dashboard</h1>
        
        {loading && (
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span>Loading...</span>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800">Error:</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Execution Logs (live on screen):</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-96">
            {log.map((msg, i) => (
              <div key={i}>{i+1}. {msg}</div>
            ))}
            {log.length === 0 && <div>No logs yet... this is really bad!</div>}
          </div>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload and Retry
        </button>
      </div>
    </div>
  )
}
