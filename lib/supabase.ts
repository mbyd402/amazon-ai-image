// 🎯 Supabase 客户端 - 修复 Vercel 环境变量问题
// 这个版本专门解决 Vercel 环境变量注入问题

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 🎯 环境变量诊断
const diagnoseEnvVars = () => {
  console.log('=== Supabase 环境变量诊断 ===')
  
  // 检查所有 NEXT_PUBLIC_ 变量
  const allKeys = Object.keys(process.env)
  const nextPublicKeys = allKeys.filter(key => key.startsWith('NEXT_PUBLIC_'))
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    isClient: typeof window !== 'undefined',
    nodeEnv: process.env.NODE_ENV,
    supabaseUrl: {
      value: supabaseUrl,
      length: supabaseUrl.length,
      isEmpty: supabaseUrl === '',
      exists: !!supabaseUrl,
      preview: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'N/A'
    },
    supabaseAnonKey: {
      exists: !!supabaseAnonKey,
      length: supabaseAnonKey.length,
      isEmpty: supabaseAnonKey === '',
      preview: supabaseAnonKey ? '***已设置***' : 'N/A'
    },
    allNextPublicVars: nextPublicKeys.map(key => ({
      key,
      length: process.env[key]?.length || 0,
      isEmpty: process.env[key] === '',
      preview: process.env[key] ? `${process.env[key]?.substring(0, 5)}...` : 'empty'
    })),
    hasAnyNextPublicVars: nextPublicKeys.length > 0,
    totalNextPublicVars: nextPublicKeys.length
  }
  
  console.log('诊断结果:', diagnosis)
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase环境变量缺失')
    console.error('请在Vercel中配置:')
    console.error('1. NEXT_PUBLIC_SUPABASE_URL = 你的Supabase项目URL')
    console.error('2. NEXT_PUBLIC_SUPABASE_ANON_KEY = 你的Supabase Anon Key')
    console.error('检测到的NEXT_PUBLIC_变量:', nextPublicKeys)
  } else {
    console.log('✅ Supabase环境变量正常')
  }
  
  console.log('=== 诊断结束 ===')
  
  return { supabaseUrl, supabaseAnonKey, diagnosis }
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
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } }
      }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ 
        data: { session: null, user: null }, 
        error: { message: 'Supabase配置缺失' }
      })
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ 
            data: null, 
            error: { message: `Supabase配置缺失 - 无法查询${table}` }
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
  // 单例模式
  if (clientInstance) {
    return clientInstance
  }
  
  const { supabaseUrl, supabaseAnonKey } = diagnoseEnvVars()
  
  // 检查环境变量
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
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-application-name': 'amazon-ai-image',
          'x-version': '1.0.0'
        }
      }
    })
    
    // 测试连接
    setTimeout(() => {
      clientInstance.auth.getSession().then((session: any) => {
        if (session.error) {
          console.error('🔗 Supabase连接测试失败:', session.error.message)
        } else {
          console.log('🔗 Supabase连接正常')
        }
      }).catch((error: any) => {
        console.error('🔗 Supabase连接异常:', error)
      })
    }, 1000)
    
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
    envVars: diagnoseEnvVars().diagnosis,
    connectionTest: '请查看控制台获取详细连接测试结果'
  }
}

// 🎯 环境变量状态
export const getEnvStatus = () => {
  return diagnoseEnvVars().diagnosis
}

// 🎯 兼容性导出（为现有代码）
export const getSupabaseClient = () => {
  console.log('🔧 使用兼容性函数 getSupabaseClient()，建议改用 createClient()')
  return createClient()
}

export const checkSupabaseConnection = async () => {
  console.log('🔧 使用兼容性函数 checkSupabaseConnection()，建议改用 diagnoseSupabase()')
  return await diagnoseSupabase()
}

export default { createClient, diagnoseSupabase, getEnvStatus, getSupabaseClient, checkSupabaseConnection }