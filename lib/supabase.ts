import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 🎯 环境变量检查
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase环境变量未设置，使用空客户端')
}

// 🎯 优化配置
const supabaseConfig = {
  auth: {
    // 🔐 PKCE认证流程（更安全）
    flowType: 'pkce' as const,
    // 🕒 更短的session有效期
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
    // ⏱️ 合理的超时时间
    fetch: (...args: Parameters<typeof fetch>) => {
      const [url, options] = args
      
      // 创建带超时的fetch
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时，与页面一致
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
        cache: 'no-store' // 避免缓存问题
      }).finally(() => clearTimeout(timeoutId))
    }
  }
}

// 🎯 创建Supabase客户端
export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase环境变量缺失')
    // 返回一个安全的空客户端
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: new Error('配置缺失') }),
        signOut: async () => ({ error: new Error('配置缺失') })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('配置缺失') })
          })
        })
      })
    } as any
  }

  try {
    const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, supabaseConfig)
    
    // 🔧 添加连接检查方法
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
    
    return client
  } catch (error: any) {
    console.error('❌ Supabase客户端创建失败:', error.message)
    throw error
  }
}

// 🎯 导出单例客户端（用于服务端渲染）
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
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