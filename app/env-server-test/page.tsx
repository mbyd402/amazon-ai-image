// 这个是服务器组件，在服务端读取环境变量
// 看看服务端能不能读到

export const dynamic = 'force-dynamic'

export default function EnvServerTestPage() {
  // 在服务端读取
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const paypal = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  console.log('=== 服务端环境变量测试 [详细调试] ===')
  console.log('typeof NEXT_PUBLIC_SUPABASE_URL:', typeof url)
  console.log('NEXT_PUBLIC_SUPABASE_URL === undefined:', url === undefined)
  console.log('NEXT_PUBLIC_SUPABASE_URL === "":', url === '')
  console.log('NEXT_PUBLIC_SUPABASE_URL length:', url?.length)

  console.log('typeof NEXT_PUBLIC_SUPABASE_ANON_KEY:', typeof key)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY === undefined:', key === undefined)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY === "":', key === '')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY length:', key?.length)

  const allKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))

  // 检查每个变量
  const allVarsInfo = allKeys.map(key => ({
    name: key,
    type: typeof process.env[key],
    isUndefined: process.env[key] === undefined,
    isEmpty: process.env[key] === '',
    length: process.env[key]?.length ?? 0
  }))

  console.log('所有 NEXT_PUBLIC_ 变量信息:', allVarsInfo)

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🖥️ 服务端环境变量测试（详细调试）</h1>
      <p>这个页面在服务端读取环境变量，看看 Vercel 构建时服务端能不能读到。</p>

      <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>NEXT_PUBLIC_SUPABASE_URL</h2>
        <p>类型: {typeof url}</p>
        <p>是 undefined: {url === undefined ? '✅ 是' : '❌ 否'}</p>
        <p>是空字符串: {url === '' ? '✅ 是' : '❌ 否'}</p>
        <p>长度: {url?.length ?? 0}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>NEXT_PUBLIC_SUPABASE_ANON_KEY</h2>
        <p>类型: {typeof key}</p>
        <p>是 undefined: {key === undefined ? '✅ 是' : '❌ 否'}</p>
        <p>是空字符串: {key === '' ? '✅ 是' : '❌ 否'}</p>
        <p>长度: {key?.length ?? 0}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>NEXT_PUBLIC_PAYPAL_CLIENT_ID</h2>
        <p>类型: {typeof paypal}</p>
        <p>是 undefined: {paypal === undefined ? '✅ 是' : '❌ 否'}</p>
        <p>是空字符串: {paypal === '' ? '✅ 是' : '❌ 否'}</p>
        <p>长度: {paypal?.length ?? 0}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>所有 NEXT_PUBLIC_ 变量 ({allKeys.length} 个):</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>变量名</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>类型</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>undefined</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>空字符串</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>长度</th>
            </tr>
          </thead>
          <tbody>
            {allVarsInfo.map((info, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{info.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{info.type}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{info.isUndefined ? '✅' : '❌'}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{info.isEmpty ? '✅' : '❌'}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{info.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#fff3e0', borderRadius: '8px' }}>
        <h3>💡 结果解读：</h3>
        <ul>
          <li><strong>如果全部显示 "是空字符串: ✅"</strong> → Vercel 确实保存了空值，虽然你看到有值</li>
          <li><strong>如果全部显示 "是 undefined: ✅"</strong> → Vercel 根本没有这些变量</li>
          <li><strong>如果有长度但不为空</strong> → 那就是好的</li>
        </ul>
      </div>
    </div>
  )
}
