// 生成环境变量配置文件，确保 NEXT_PUBLIC_ 变量一定可用
// 在构建前运行这个脚本

const fs = require('fs')
const path = require('path')

console.log('=== 生成环境变量配置 ===')
console.log('process.env has', Object.keys(process.env).length, 'total variables')

// 收集所有 NEXT_PUBLIC_ 环境变量
const envPublic = {}
Object.keys(process.env).forEach(key => {
  if (key.startsWith('NEXT_PUBLIC_')) {
    const value = process.env[key]
    envPublic[key] = value
    console.log(`✅ ${key}: 长度 ${value.length}, 首字符 ${value[0]}`)
  }
})

console.log(`\n找到 ${Object.keys(envPublic).length} 个 NEXT_PUBLIC_ 变量`)
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
