import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { publicEnv } from '@/lib/generated-env'

// 🎯 环境变量诊断
const diagnoseEnvVars = () => {
  console.log('=== Supabase 环境变量诊断 (从生成的文件读取) ===')
  
  // 优先使用生成的环境变量
  // @ts-ignore - publicEnv 是动态生成的
  let supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL || ''
  // @ts-ignore - publicEnv 是动态生成的
  let supabaseAnonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // 如果生成的文件为空，回退到 process.env
  if (!supabaseUrl) {
    console.warn('⚠️ 生成文件中没有找到 URL，回退到 process.env')
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  }
  if (!supabaseAnonKey) {
    console.warn('⚠️ 生成文件中没有找到 Key，回退到 process.env')
    supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  }
  
  const allKeys = Object.keys(publicEnv)
  const nextPublicKeys = allKeys.filter(key => key.startsWith('NEXT_PUBLIC_'))
  
  console.log('Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : '未找到')
  console.log('Supabase Key:', supabaseAnonKey ? `***已设置 (长度: ${supabaseAnonKey.length})***` : '未找到')
  console.log('所有 NEXT_PUBLIC_ 变量 (从生成文件):', nextPublicKeys)
  console.log('=== 诊断结束 ===')
  
  return { supabaseUrl, supabaseAnonKey }
}

// 🎯 降级客户端
const createFallbackClient = () => {
  console.warn('⚠️ 使用降级客户端（环境变量缺失）')
  
  return {
    auth: {
      getSession: async () => ({ 
        data: { session: null }, 
        error: { message: 'Supabase配置缺失。请在Vercel中配置环境变量。' }
      }),
      getUser: async () => ({ 
        data: { user: null }, 
        error: { message: 'Supabase配置缺失' }
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: any) => {
        console.log('降级客户端：模拟 onAuthStateChange')
        // 返回一个取消订阅函数
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      signInWithPassword: async () => ({ 
        data: { session: null, user: null }, 
        error: { message: 'Supabase配置缺失' }
      })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ 
            data: null, 
            error: { message: 'Supabase配置缺失' }
          })
        })
      })
    }),
    _isFallback: true
  }
}

// 🎯 创建Supabase客户端
let clientInstance: any = null

export const createClient = () => {
  if (clientInstance) {
    return clientInstance
  }
  
  const { supabaseUrl, supabaseAnonKey } = diagnoseEnvVars()
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 无法创建Supabase客户端 - 环境变量缺失')
    clientInstance = createFallbackClient()
    return clientInstance
  }
  
  try {
    console.log('✅ 创建真实Supabase客户端')
    
    clientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
    
    return clientInstance
    
  } catch (error: any) {
    console.error('❌ 创建Supabase客户端出错:', error)
    clientInstance = createFallbackClient()
    return clientInstance
  }
}

// 🎯 诊断工具
export const diagnoseSupabase = async () => {
  const client = createClient()
  
  return {
    timestamp: new Date().toISOString(),
    clientType: client._isFallback ? '降级客户端' : '真实客户端',
    hasEnvVars: !client._isFallback
  }
}

// 🎯 兼容性导出
export const getSupabaseClient = () => {
  console.log('🔧 使用兼容性函数 getSupabaseClient()')
  return createClient()
}

export const checkSupabaseConnection = async () => {
  console.log('🔧 使用兼容性函数 checkSupabaseConnection()')
  return await diagnoseSupabase()
}

// 🎯 环境变量状态
export const getEnvStatus = () => {
  const { supabaseUrl, supabaseAnonKey } = diagnoseEnvVars()
  return {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
    supabaseUrlLength: supabaseUrl.length,
    supabaseAnonKeyLength: supabaseAnonKey.length
  }
}

// 默认导出
export default {
  createClient,
  diagnoseSupabase,
  getSupabaseClient,
  checkSupabaseConnection,
  getEnvStatus
}