// 最简单的环境变量诊断页面，避免任何复杂依赖
'use client'

export default function EnvSimpleDiagnosisPage() {
  // 这个页面只渲染静态HTML，JavaScript在客户端执行
  const css = `
    body {
      font-family: monospace;
      margin: 20px;
      line-height: 1.6;
      background: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #0070f3;
      padding-bottom: 10px;
    }
    .result {
      margin: 15px 0;
      padding: 10px;
      border-radius: 4px;
    }
    .success {
      background: #e8f5e8;
      border: 1px solid #4caf50;
    }
    .error {
      background: #ffebee;
      border: 1px solid #f44336;
    }
    .warning {
      background: #fff3e0;
      border: 1px solid #ff9800;
    }
    code {
      background: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    }
    button {
      background: #0070f3;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    button:hover {
      background: #0051a8;
    }
    pre {
      background: #f8f8f8;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
      max-height: 300px;
    }
  `

  return (
    <div style={{ fontFamily: 'monospace, monospace', margin: '20px', lineHeight: '1.6', background: '#f5f5f5', minHeight: '100vh' }}>
      <title>环境变量简单诊断</title>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="container">
        <h1>🔍 环境变量简单诊断</h1>
        
        <div id="results">
          <p>正在检查环境变量...</p>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <h3>诊断命令</h3>
          <p>在浏览器控制台（F12 → Console）运行以下命令：</p>
          <pre>
{`// 检查所有环境变量
console.log('所有环境变量键:', Object.keys(process.env).length)

// 检查 NEXT_PUBLIC_ 变量
const nextPublic = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))
console.log('NEXT_PUBLIC_ 变量:', nextPublic)

// 检查 Supabase 变量
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_FOUND')
console.log('URL 长度:', process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY 存在:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('Key 长度:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0)
`}
          </pre>
          
          <button onClick={runDiagnosis}>运行诊断</button>
          <button onClick={checkAllEnvVars}>显示所有变量</button>
        </div>
        
        <div style={{ marginTop: '30px', padding: '15px', background: '#e3f2fd', borderRadius: '4px' }}>
          <h3>💡 问题诊断</h3>
          <p>如果 Supabase 环境变量显示为 "NOT_FOUND"，可能的原因：</p>
          <ol>
            <li><strong>Vercel 环境变量未配置</strong>：在 Vercel 项目设置中检查</li>
            <li><strong>变量名称错误</strong>：必须是 <code>NEXT_PUBLIC_SUPABASE_URL</code> 和 <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
            <li><strong>构建时 vs 运行时</strong>：Next.js 可能在构建时无法访问环境变量</li>
            <li><strong>需要重新部署</strong>：环境变量更改后需要重新部署</li>
          </ol>
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{ __html: `
        function runDiagnosis() {
          const results = document.getElementById('results')
          results.innerHTML = '<p>运行诊断中...</p>'
          
          setTimeout(() => {
            const allKeys = Object.keys(process.env)
            const nextPublicKeys = allKeys.filter(key => key.startsWith('NEXT_PUBLIC_'))
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
            
            let html = '<h3>诊断结果</h3>'
            
            html += \`<div class="result \${nextPublicKeys.length > 0 ? 'warning' : 'error'}">
              <p><strong>NEXT_PUBLIC_ 变量数量:</strong> \${nextPublicKeys.length}</p>
              \${nextPublicKeys.length > 0 ? 
                \`<p>检测到的变量: \${nextPublicKeys.join(', ')}</p>\` : 
                '<p>没有检测到 NEXT_PUBLIC_ 变量！</p>'
              }
            </div>\`
            
            html += \`<div class="result \${supabaseUrl ? 'success' : 'error'}">
              <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> \${supabaseUrl ? '✅ 已设置' : '❌ 未找到'}</p>
              \${supabaseUrl ? \`<p>长度: \${supabaseUrl.length} 字符</p>\` : ''}
            </div>\`
            
            html += \`<div class="result \${supabaseKey ? 'success' : 'error'}">
              <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> \${supabaseKey ? '✅ 已设置' : '❌ 未找到'}</p>
              \${supabaseKey ? \`<p>长度: \${supabaseKey.length} 字符</p>\` : ''}
            </div>\`
            
            // 在控制台也输出
            console.log('=== 简单诊断结果 ===')
            console.log('总环境变量:', allKeys.length)
            console.log('NEXT_PUBLIC_ 变量:', nextPublicKeys)
            console.log('Supabase URL:', supabaseUrl || 'NOT_FOUND')
            console.log('Supabase URL 长度:', supabaseUrl.length)
            console.log('Supabase Key 存在:', !!supabaseKey)
            console.log('Supabase Key 长度:', supabaseKey.length)
            
            results.innerHTML = html
          }, 100)
        }
        
        function checkAllEnvVars() {
          console.log('=== 所有环境变量 ===')
          const allKeys = Object.keys(process.env)
          allKeys.forEach(key => {
            const value = process.env[key]
            console.log(\`\${key}:\`, {
              length: value?.length || 0,
              isEmpty: value === '',
              preview: value ? \`\${value.substring(0, 20)}...\` : 'empty'
            })
          })
          alert('所有环境变量已打印到控制台（F12 → Console）')
        }
        
        // 页面加载时自动运行诊断
        window.addEventListener('DOMContentLoaded', runDiagnosis)
      `}} />
    </div>
  )
}

function runDiagnosis() {
  const results = document.getElementById('results')
  if (results) {
    results.innerHTML = '<p>运行诊断中...</p>'
  }
}

function checkAllEnvVars() {
  console.log('=== 所有环境变量 ===')
  const allKeys = Object.keys(process.env || {})
  allKeys.forEach(key => {
    const value = (process.env || {})[key]
    console.log(`${key}:`, {
      length: value?.length || 0,
      isEmpty: value === '',
      preview: value ? `${value.substring(0, 20)}...` : 'empty'
    })
  })
  alert('所有环境变量已打印到控制台（F12 → Console）')
}
