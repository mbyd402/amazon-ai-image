'use client'

export const dynamic = 'force-dynamic'

export default function EnvDebugPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('=== 环境变量详细调试 ===')
  console.log('URL:', url)
  console.log('URL length:', url?.length)
  console.log('URL typeof:', typeof url)
  console.log('URL includes space:', url?.includes(' '))
  console.log('URL includes newline:', url?.includes('\n'))
  console.log('URL trim length:', url?.trim().length)
  console.log('Key:', key ? `***${key.length} chars***` : 'undefined')
  console.log('Key length:', key?.length)
  console.log('Key trim length:', key?.trim().length)
  console.log('process.env:', process.env)
  console.log('All NEXT_PUBLIC_ keys:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')))

  const allNextPublicKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔍 环境变量详细调试</h1>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>NEXT_PUBLIC_SUPABASE_URL</h2>
        <p>存在: {url ? '✅ 是' : '❌ 否'}</p>
        <p>原始长度: {url?.length ?? 0}</p>
        <p>trim后长度: {url?.trim().length ?? 0}</p>
        <p>包含空格: {url?.includes(' ') ? '⚠️ 是' : '✅ 否'}</p>
        <p>包含换行: {url?.includes('\n') ? '⚠️ 是' : '✅ 否'}</p>
        {url && (
          <div>
            <p>原始值:</p>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', wordBreak: 'break-all' }}>
              {JSON.stringify(url)}
            </pre>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>NEXT_PUBLIC_SUPABASE_ANON_KEY</h2>
        <p>存在: {key ? '✅ 是' : '❌ 否'}</p>
        <p>原始长度: {key?.length ?? 0}</p>
        <p>trim后长度: {key?.trim().length ?? 0}</p>
        <p>包含空格: {key?.includes(' ') ? '⚠️ 是' : '✅ 否'}</p>
        <p>包含换行: {key?.includes('\n') ? '⚠️ 是' : '✅ 否'}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>所有 NEXT_PUBLIC_ 变量</h2>
        <ul>
          {allNextPublicKeys.map((key, idx) => (
            <li key={idx}>{key} (长度: {(process.env as any)[key]?.length || 0})</li>
          ))}
        </ul>
        {allNextPublicKeys.length === 0 && (
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            ❌ 没有任何 NEXT_PUBLIC_ 变量！这说明根本没有注入进来。
          </p>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <p><strong>请按 F12 打开控制台查看完整输出，然后把结果告诉我。</strong></p>
      </div>
    </div>
  )
}
