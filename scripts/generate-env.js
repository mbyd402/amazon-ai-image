// 生成环境变量配置文件，确保 NEXT_PUBLIC_ 变量一定可用
// 在构建前运行这个脚本

const fs = require('fs')
const path = require('path')

console.log('=== 生成环境变量配置 ===')
console.log('process.env has', Object.keys(process.env).length, 'total variables')

// 收集所有 NEXT_PUBLIC_ 环境变量
// 即使 Vercel 有 bug，我们也尝试各种方法读取
const envPublic = {}

// 方法1: 直接遍历
Object.keys(process.env).forEach(key => {
  if (key.startsWith('NEXT_PUBLIC_')) {
    // 尝试多种方式读取
    let value = null
    // 方式1: 点访问
    if (value === null || value === undefined || value === '') {
      value = process.env[key]
    }
    // 方式2: 索引访问
    if (value === null || value === undefined || value === '') {
      value = process.env[`${key}`]
    }
    // 方式3: JSON.parse 重新获取
    try {
      if (value === null || value === undefined || value === '') {
        const all = JSON.parse(JSON.stringify(process.env))
        value = all[key]
      }
    } catch (e) {}
    
    envPublic[key] = value || ''
    const displayFirstChar = value && value.length > 0 ? value[0] : 'undefined'
    console.log(`✅ ${key}: 长度 ${(value || '').length}, 首字符 ${displayFirstChar}`)
  }
})

console.log(`\n找到 ${Object.keys(envPublic).length} 个 NEXT_PUBLIC_ 变量`)

// 特殊处理你需要的几个变量，检查它们
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
]

requiredVars.forEach(varName => {
  if (envPublic[varName]) {
    console.log(`🎯 ${varName}: 已找到，长度 ${envPublic[varName].length}`)
  } else {
    console.log(`❌ ${varName}: 未找到或为空`)
  }
})

console.log('envPublic:', JSON.stringify(envPublic, null, 2))

const content = `// 这个文件由 scripts/generate-env.js 在构建时自动生成
// 包含所有 NEXT_PUBLIC_ 环境变量

export const publicEnv = ${JSON.stringify(envPublic, null, 2)}

export default publicEnv
`

const outputPath = path.join(process.cwd(), 'lib', 'generated-env.ts')
fs.writeFileSync(outputPath, content)

console.log(`\n✅ 已写入到 ${outputPath}`)
console.log('Wrote', Object.keys(envPublic).length, 'variables')
