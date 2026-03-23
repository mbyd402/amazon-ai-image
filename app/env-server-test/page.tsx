// 这个是服务器组件，在服务端读取环境变量
// 看看服务端能不能读到

export const dynamic = 'force-dynamic'

export default function EnvServerTestPage() {
  // 在服务端读取
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('=== 服务端环境变量测试 ===')
  console.log('Server: NEXT_PUBLIC_SUPABASE_URL exists:', !!url)
  console.log('Server: NEXT_PUBLIC_SUPABASE_URL length:', url?.length)
  console.log('Server: NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!key)

  const allKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🖥️ 服务端环境变量测试</h1>
      <p>这个页面在服务端读取环境变量，看看 Vercel 构建时服务端能不能读到。</p>

      <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>服务端读取结果</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>变量</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>状态</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>长度</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>NEXT_PUBLIC_SUPABASE_URL</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {url ? '✅ 存在' : '❌ 不存在'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {url?.length ?? 0}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {key ? '✅ 存在' : '❌ 不存在'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {key?.length ?? 0}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>所有 NEXT_PUBLIC_ 变量 ({allKeys.length} 个):</h3>
        <ul>
          {allKeys.map((k, i) => <li key={i}>{k}</li>)}
        </ul>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3>💡 结果说明：</h3>
        <ul>
          <li>如果服务端能读到，客户端读不到 → 说明是 Next.js 客户端注入问题</li>
          <li>如果服务端也读不到 → 说明 Vercel 根本没有把环境变量传给构建进程</li>
          <li>这时候你需要联系 Vercel 支持，或者删除项目重新创建</li>
        </ul>
      </div>
    </div>
  )
}
