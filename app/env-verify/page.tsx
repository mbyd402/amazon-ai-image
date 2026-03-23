'use client'

export const dynamic = 'force-dynamic'

export default function EnvVerifyPage() {
  // 在 Next.js 中，环境变量必须在构建时内联
  // 这里直接读取，Next.js 会替换它们
  const urlFromBuild = process.env.NEXT_PUBLIC_SUPABASE_URL
  const keyFromBuild = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('=== 直接环境变量验证 ===')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', urlFromBuild)
  console.log('NEXT_PUBLIC_SUPABASE_URL 类型:', typeof urlFromBuild)
  console.log('NEXT_PUBLIC_SUPABASE_URL 长度:', urlFromBuild?.length)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', keyFromBuild ? `***长度: ${keyFromBuild.length}***` : 'undefined/null/空')
  console.log('process.env 对象:', process.env)
  console.log('Object.keys(process.env):', Object.keys(process.env))

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>环境变量直接验证</h1>
      <p>这个页面直接读取环境变量，Next.js 会在构建时内联它们。</p>

      <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>构建时内联结果</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>变量名</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>状态</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>长度</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>NEXT_PUBLIC_SUPABASE_URL</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {urlFromBuild ? '✅ 已存在' : '❌ 不存在'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {urlFromBuild?.length ?? 0}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {keyFromBuild ? '✅ 已存在' : '❌ 不存在'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {keyFromBuild?.length ?? 0}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>原始值（前30个字符）：</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
          NEXT_PUBLIC_SUPABASE_URL: {urlFromBuild ? urlFromBuild.substring(0, 30) + '...' : '(空)'}
        </pre>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#fff3e0', borderRadius: '8px' }}>
        <h3>💡 关键说明</h3>
        <ul>
          <li>在 Next.js 中，只有 <code>NEXT_PUBLIC_</code> 前缀的环境变量才会暴露给客户端</li>
          <li>这些变量是<strong>在构建时静态内联</strong>的，而不是在运行时从环境读取</li>
          <li>如果构建时 Vercel 没有设置这些变量，代码中就会得到 undefined</li>
          <li>你可以在 Vercel 项目设置 → Environment Variables 查看和修改</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p><strong>请按 F12 打开控制台查看完整输出</strong></p>
      </div>
    </div>
  )
}
