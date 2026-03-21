import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'x-application-name': 'amazon-ai-image-tool',
    },
    // 只在浏览器环境中添加自定义fetch（避免服务器端问题）
    ...(typeof window !== 'undefined' && {
      fetch: (url, options) => {
        // 自定义fetch，增加超时
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)
        
        return fetch(url, {
          ...options,
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId))
      }
    })
  }
})

// 辅助函数：检查Supabase连接
export async function checkSupabaseConnection() {
  try {
    const start = Date.now()
    const { data, error } = await supabase.auth.getSession()
    const duration = Date.now() - start
    
    return {
      connected: !error,
      duration,
      error: error?.message,
      hasSession: !!data?.session
    }
  } catch (err) {
    return {
      connected: false,
      duration: 0,
      error: err instanceof Error ? err.message : String(err),
      hasSession: false
    }
  }
}
