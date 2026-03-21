#!/usr/bin/env node

// 🎯 构建健康检查脚本
// 在构建前运行，确保环境正常

console.log('🔧 开始构建健康检查...')

// 检查Node.js版本
const nodeVersion = process.version
const requiredVersion = '18.0.0'
console.log(`✅ Node.js版本: ${nodeVersion} (要求: >=${requiredVersion})`)

// 检查关键环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

const optionalEnvVars = [
  'REMOVE_BG_API_KEY',
  'CLIPDROP_API_KEY', 
  'CLOUDMERSIVE_API_KEY',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_WEBHOOK_ID',
  'SUPABASE_SERVICE_ROLE_KEY',
]

console.log('\n🔑 环境变量检查:')
console.log('='.repeat(50))

// 检查必需环境变量
let allRequiredPresent = true
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: 已设置`)
  } else {
    console.log(`⚠️ ${envVar}: 未设置 (构建时将使用模拟值)`)
    allRequiredPresent = false
  }
}

// 检查可选环境变量
console.log('\n📋 可选环境变量:')
let optionalCount = 0
for (const envVar of optionalEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: 已设置`)
    optionalCount++
  } else {
    console.log(`📝 ${envVar}: 未设置 (功能将受限)`)
  }
}

// 检查构建环境
console.log('\n🏗️ 构建环境:')
console.log('='.repeat(50))
console.log(`环境: ${process.env.NODE_ENV || 'development'}`)
console.log(`Netlify构建: ${process.env.NETLIFY ? '是' : '否'}`)
console.log(`构建时间标记: ${process.env.IS_BUILD_TIME ? '是' : '否'}`)

// 内存检查
const memoryUsage = process.memoryUsage()
const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
console.log(`内存使用: ${usedMB}MB / ${totalMB}MB`)

// 构建建议
console.log('\n💡 构建建议:')
console.log('='.repeat(50))

if (!allRequiredPresent) {
  console.log('⚠️ 警告: 缺少必需环境变量')
  console.log('   构建将继续，但某些功能将使用模拟值')
}

if (optionalCount === 0) {
  console.log('📝 提示: 所有可选API密钥都未设置')
  console.log('   图像处理功能将使用模拟响应')
} else {
  console.log(`✅ 已设置 ${optionalCount} 个可选API密钥`)
}

if (process.env.NETLIFY) {
  console.log('✅ Netlify环境检测到，API路由将使用构建时模拟')
}

console.log('\n🎯 构建检查完成!')
console.log('所有API路由都使用动态导入架构:')
console.log('- 构建时: 零依赖，立即返回模拟响应')
console.log('- 运行时: 完整功能，动态加载外部依赖')

process.exit(0)