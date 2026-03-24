import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 🎯 环境变量检查
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase环境变量未设置，使用空客户端')
}

// 🎯 优化配置 - use implicit flow for OAuth to avoid PKCE code_verifier issues
const supabaseConfig = {
  auth: {
    // 🚀 Use implicit flow instead of PKCE to avoid code verifier storage problems
    flowType: 'implicit' as const,
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    // 🚀 优化存储
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'amazon-ai-supabase-auth',
    // 🔧 错误处理
    debug: process.env.NODE_ENV === 'development'
  },
  // 🌐 网络优化
  global: {
    headers: {
      'x-application-name': 'amazon-ai-image',
      'x-client-type': 'web'
    },
    // ⏱️ 更短的超时时间
    fetch: (...args: Parameters<typeof fetch>) => {
      const [url, options] = args
      
      // 创建带超时的fetch
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15秒超时
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
        cache: 'no-store' // 避免缓存问题
      }).finally(() => clearTimeout(timeoutId))
    }
  }
}

// 🎯 Create a new client every time - avoids deadlock from shared locks
// Supabase will warn about multiple instances but it won't deadlock
export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase环境变量缺失')
    // Return a safe mock client
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: new Error('Missing environment variables') }),
        signOut: async () => ({ error: new Error('Missing environment variables') }),
        onAuthStateChange: () => ({ subscription: { unsubscribe: () => {} } }),
        exchangeCodeForSession: async () => ({ data: { session: null }, error: new Error('Missing environment variables') })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Missing environment variables') })
          })
        })
      })
    } as any
  }

  try {
    console.log('🔧 Creating new Supabase client')
    const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, supabaseConfig) as any
    
    // 🔧 Add connection check method
    client.checkConnection = async () => {
      try {
        const startTime = Date.now()
        const { error } = await client.auth.getSession()
        const responseTime = Date.now() - startTime
        
        return {
          success: !error,
          responseTime,
          error: error?.message,
          status: error ? 'offline' : 'online'
        }
      } catch (err: any) {
        return {
          success: false,
          responseTime: 0,
          error: err.message,
          status: 'offline'
        }
      }
    }
    
    console.log('✅ Supabase client created successfully')
    return client
  } catch (error: any) {
    console.error('❌ Supabase客户端创建失败:', error.message)
    throw error
  }
}

// 🎯 Get the singleton client
export const getSupabaseClient = () => {
  return createClient()
}

// 🎯 辅助函数：检查Supabase连接
export const checkSupabaseConnection = async () => {
  console.log('🔍 检查Supabase连接...')
  
  const tests = {
    domain: { success: false, message: '' },
    api: { success: false, message: '' },
    auth: { success: false, message: '' },
    database: { success: false, message: '' }
  }

  try {
    // 1. 检查域名可达性
    if (supabaseUrl) {
      try {
        const response = await fetch(supabaseUrl, { method: 'HEAD' })
        tests.domain.success = response.ok
        tests.domain.message = response.ok ? '可达' : `HTTP ${response.status}`
      } catch (err: any) {
        tests.domain.message = err.message
      }
    }

    // 2. 检查API密钥
    tests.api.success = !!supabaseAnonKey
    tests.api.message = supabaseAnonKey ? '有效' : '未设置'

    // 3. 检查认证
    const client = createClient()
    const authCheck = await client.checkConnection()
    tests.auth.success = authCheck.success
    tests.auth.message = authCheck.success ? 
      `正常 (${authCheck.responseTime}ms)` : 
      `失败: ${authCheck.error}`

    // 4. 检查数据库连接（简单查询）
    if (tests.auth.success) {
      try {
        const startTime = Date.now()
        const { error } = await client.from('users').select('count').limit(1)
        const responseTime = Date.now() - startTime
        
        tests.database.success = !error
        tests.database.message = !error ? 
          `正常 (${responseTime}ms)` : 
          `失败: ${error.message}`
      } catch (err: any) {
        tests.database.message = `异常: ${err.message}`
      }
    } else {
      tests.database.message = '跳过（认证失败）'
    }

    // 总结
    const allSuccess = Object.values(tests).every(test => test.success)
    
    return {
      success: allSuccess,
      tests,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      url: supabaseUrl ? '已设置' : '未设置',
      key: supabaseAnonKey ? `已设置 (${supabaseAnonKey.substring(0, 10)}...)` : '未设置'
    }
  } catch (error: any) {
    console.error('❌ 连接检查失败:', error)
    return {
      success: false,
      error: error.message,
      tests,
      timestamp: new Date().toISOString()
    }
  }
}

// 🎯 类型扩展
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    checkConnection: () => Promise<{
      success: boolean
      responseTime: number
      error?: string
      status: 'online' | 'offline'
    }>
  }
}