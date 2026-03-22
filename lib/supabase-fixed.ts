import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 🎯 Vercel 环境变量诊断
const diagnoseEnvVars = () => {
  console.log('🔍 环境变量诊断开始...')
  
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
      exists: !!supabaseUrl
    },
    supabaseAnonKey: {
      value: supabaseAnonKey ? '***已设置***' : '',
      length: supabaseAnonKey.length,
      isEmpty: supabaseAnonKey === '',
      exists: !!supabaseAnonKey
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
  
  console.log('📊 环境变量诊断结果:', diagnosis)
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase环境变量缺失:', {
      supabaseUrl: supabaseUrl || '未找到',
      supabaseUrlLength: supabaseUrl.length,
      supabaseAnonKey: supabaseAnonKey ? '***已设置***' : '未找到',
      supabaseAnonKeyLength: supabaseAnonKey.length,
      nextPublicVarsCount: nextPublicKeys.length,
      allNextPublicVars: nextPublicKeys
    })
  } else {
    console.log('✅ Supabase环境变量正常:', {
      supabaseUrl: `${supabaseUrl.substring(0, 15)}...`,
      supabaseUrlLength: supabaseUrl.length,
      supabaseAnonKey: '***已设置***',
      supabaseAnonKeyLength: supabaseAnonKey.length
    })
  }
  
  return { supabaseUrl, supabaseAnonKey, diagnosis }
}

// 🎯 降级客户端（环境变量缺失时使用）
const createFallbackClient = () => {
  console.warn('⚠️ 创建降级客户端（环境变量缺失）')
  
  return {
    auth: {
      getSession: async () => ({ 
        data: { session: null }, 
        error: { message: 'Supabase配置缺失 - 请在Vercel中配置NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY' }
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
            error: { message: `Supabase配置缺失 - 无法查询${table}表` }
          })
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => ({ 
            data: null, 
            error: { message: `Supabase配置缺失 - 无法插入到${table}表` }
          })
        })
      }),
      update: (data: any) => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ 
              data: null, 
              error: { message: `Supabase配置缺失 - 无法更新${table}表` }
            })
          })
        })
      })
    }),
    // 标记为降级客户端
    _isFallback: true
  }
}

// 🎯 创建Supabase客户端
let clientInstance: any = null

export const createClient = () => {
  // 单例模式，避免重复创建
  if (clientInstance) {
    return clientInstance
  }
  
  const { supabaseUrl, supabaseAnonKey, diagnosis } = diagnoseEnvVars()
  
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
          'x-app-version': '1.0.0'
        },
      },
      db: {
        schema: 'public'
      }
    })
    
    // 测试连接
    clientInstance.auth.getSession().then((session: any) => {
      console.log('🔗 Supabase连接测试:', {
        success: !session.error,
        hasSession: !!session.data?.session,
        error: session.error?.message
      })
    }).catch((error: any) => {
      console.error('🔗 Supabase连接测试失败:', error)
    })
    
    return clientInstance
    
  } catch (error: any) {
    console.error('❌ 创建Supabase客户端时出错:', error)
    clientInstance = createFallbackClient()
    return clientInstance
  }
}

// 🎯 导出诊断工具
export const diagnoseSupabase = async () => {
  const client = createClient()
  
  const tests = {
    clientCreation: {
      success: !client._isFallback,
      message: client._isFallback ? '使用降级客户端（环境变量缺失）' : '使用真实Supabase客户端'
    },
    authConnection: {
      success: false,
      message: '测试中...'
    },
    databaseConnection: {
      success: false,
      message: '测试中...'
    }
  }
  
  // 测试认证连接
  try {
    const session = await client.auth.getSession()
    tests.authConnection.success = !session.error
    tests.authConnection.message = session.error 
      ? `认证失败: ${session.error.message}` 
      : '认证连接正常'
  } catch (error: any) {
    tests.authConnection.message = `认证异常: ${error.message}`
  }
  
  // 测试数据库连接（如果认证正常）
  if (tests.authConnection.success) {
    try {
      const { error } = await client.from('users').select('count').limit(1)
      tests.databaseConnection.success = !error
      tests.databaseConnection.message = error 
        ? `数据库连接失败: ${error.message}` 
        : '数据库连接正常'
    } catch (error: any) {
      tests.databaseConnection.message = `数据库异常: ${error.message}`
    }
  } else {
    tests.databaseConnection.message = '跳过（认证失败）'
  }
  
  return {
    timestamp: new Date().toISOString(),
    tests,
    diagnosis: diagnoseEnvVars().diagnosis,
    recommendations: tests.clientCreation.success ? [] : [
      '1. 在Vercel中配置NEXT_PUBLIC_SUPABASE_URL环境变量',
      '2. 在Vercel中配置NEXT_PUBLIC_SUPABASE_ANON_KEY环境变量',
      '3. 确保环境变量值正确无误',
      '4. 重新部署项目使环境变量生效'
    ]
  }
}

// 🎯 导出环境变量状态
export const getEnvStatus = () => {
  return diagnoseEnvVars().diagnosis
}