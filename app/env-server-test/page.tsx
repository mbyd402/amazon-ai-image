// 这个是服务器组件，在服务端读取环境变量
// 暴力遍历所有可能性

export const dynamic = 'force-dynamic'

export default function EnvServerTestPage() {
  console.log('=== 暴力调试环境变量 ===')
  
  // 方法1: 直接访问
  const url1 = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key1 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const paypal1 = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  // 方法2: 通过字符串索引
  const url2 = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const key2 = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
  const paypal2 = process.env['NEXT_PUBLIC_PAYPAL_CLIENT_ID']

  console.log('直接访问 vs 字符串索引:')
  console.log('url1:', url1, `length: ${url1?.length}`)
  console.log('url2:', url2, `length: ${url2?.length}`)
  console.log('key1:', key1, `length: ${key1?.length}`)
  console.log('key2:', key2, `length: ${key2?.length}`)

  // 遍历所有键
  const allKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))
  
  const allVarsInfo = allKeys.map(key => {
    const value = process.env[key]
    return {
      name: key,
      nameLength: key.length,
      nameJSON: JSON.stringify(key),
      valueType: typeof value,
      isUndefined: value === undefined,
      isEmpty: value === '',
      length: value?.length ?? 0,
      firstChar: value?.[0] ?? 'none'
    }
  })

  console.log('所有变量详细信息:', allVarsInfo)

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🔪 暴力调试环境变量</h1>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>直接访问 vs 字符串索引</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>变量</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>访问方式</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>类型</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>undefined</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>空字符串</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>长度</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>NEXT_PUBLIC_SUPABASE_URL</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>dot (process.env.NAME)</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{typeof url1}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{url1 === undefined ? '✅' : '❌'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{url1 === '' ? '✅' : '❌'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{url1?.length ?? 0}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>NEXT_PUBLIC_SUPABASE_URL</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>index (process.env["NAME"])</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{typeof url2}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{url2 === undefined ? '✅' : '❌'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{url2 === '' ? '✅' : '❌'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{url2?.length ?? 0}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>dot (process.env.NAME)</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{typeof key1}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{key1 === undefined ? '✅' : '❌'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{key1 === '' ? '✅' : '❌'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{key1?.length ?? 0}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>index (process.env["NAME"])</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{typeof key2}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{key2 === undefined ? '✅' : '❌'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{key2 === '' ? '✅' : '❌'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{key2?.length ?? 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>所有 NEXT_PUBLIC_ 变量详细信息 ({allKeys.length} 个)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>变量名</th>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>名称长度</th>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>JSON</th>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>值长度</th>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>首字符</th>
            </tr>
          </thead>
          <tbody>
            {allVarsInfo.map((info, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{info.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{info.nameLength}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{info.nameJSON}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{info.length}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px' }}>{info.firstChar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#fff3e0', borderRadius: '8px' }}>
        <p><strong>请把这个页面显示的结果完整截图发给我，特别是 "直接访问 vs 字符串索引" 表格。</strong></p>
        <p>这会告诉我们到底是 dot access 有问题还是字符串索引有问题。</p>
      </div>
    </div>
  )
}
