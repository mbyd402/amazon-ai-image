'use client'

// 这个页面完全硬编码，直接检查 Next.js 是否正确内联环境变量
export default function EnvHardcodedTestPage() {
  // 直接在这里检查
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 如果构建时环境变量不存在，这些就会是 undefined
  const urlExists = !!url
  const keyExists = !!key

  console.log('=== 硬编码测试页面 ===')
  console.log('url:', url)
  console.log('key exists:', keyExists)
  console.log('typeof process.env:', typeof process.env)
  console.log('process.env.NEXT_PUBLIC_SUPABASE_URL === undefined:', typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'undefined')

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔍 硬编码环境变量测试</h1>
      <p>这个页面直接在代码中读取环境变量，用于验证 Vercel 是否正确注入。</p>

      <div style={{ marginTop: '30px', padding: '20px', border: '2px solid #000', borderRadius: '8px' }}>
        <h2>测试结果</h2>
        <div style={{ marginTop: '20px' }}>
          <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {urlExists ? '✅ 存在' : '❌ 不存在'}</p>
          {urlExists && <p>长度: {url.length} 字符</p>}
          {urlExists && url.length > 0 && (
            <p>前30字符: {url.substring(0, 30)}...</p>
          )}
        </div>
        <div style={{ marginTop: '10px' }}>
          <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {keyExists ? '✅ 存在' : '❌ 不存在'}</p>
          {keyExists && <p>长度: {key.length} 字符</p>}
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>JavaScript 输出：</h3>
        <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
{`
process.env.NEXT_PUBLIC_SUPABASE_URL = ${JSON.stringify(url)}
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ${keyExists ? `"(长度: ${key.length})"` : 'undefined'}
`}
        </pre>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3>💡 如果这里也显示不存在：</h3>
        <ol>
          <li>可以 100% 确定是 Vercel 环境变量配置问题</li>
          <li>请检查 Vercel → Settings → Environment Variables</li>
          <li>确认变量名称<strong>完全正确</strong></li>
          <li>确认变量值不为空</li>
          <li>删除这两个变量，重新添加，然后重新部署</li>
        </ol>
      </div>
    </div>
  )
}
