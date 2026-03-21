// 环境变量安全检查
// 如果缺少API密钥，使用降级方案

export const checkEnvVariables = () => {
  const missing: string[] = []
  
  // 检查必需的环境变量
  const required = [
    // 这里没有必需的变量，所有都是可选的
  ]
  
  // 检查可选的API密钥
  const optional = {
    clipdrop: process.env.CLIPDROP_API_KEY,
    cloudmersive: process.env.CLOUDMERSIVE_API_KEY,
    removeBg: process.env.REMOVE_BG_API_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  }
  
  console.log('🔍 Environment check:')
  Object.entries(optional).forEach(([key, value]) => {
    if (value && value !== 'optional' && value !== '') {
      console.log(`✅ ${key}: Available`)
    } else {
      console.log(`⚠️ ${key}: Not available (will use fallback)`)
    }
  })
  
  return {
    hasClipdrop: !!optional.clipdrop && optional.clipdrop !== 'optional',
    hasCloudmersive: !!optional.cloudmersive && optional.cloudmersive !== 'optional',
    hasRemoveBg: !!optional.removeBg && optional.removeBg !== 'optional',
    hasSupabase: !!optional.supabaseUrl && !!optional.supabaseKey && 
                 optional.supabaseUrl !== 'optional' && optional.supabaseKey !== 'optional',
    hasPaypal: !!optional.paypalClientId && optional.paypalClientId !== 'optional',
    missing
  }
}

// 获取环境状态
export const envStatus = checkEnvVariables()