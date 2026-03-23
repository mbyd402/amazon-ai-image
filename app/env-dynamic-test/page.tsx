'use client'

// 强制动态渲染，避免静态生成
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect, useState } from 'react'

export default function EnvDynamicTestPage() {
  const [diagnosis, setDiagnosis] = useState<any>(null)
  
  useEffect(() => {
    console.log('=== 动态渲染环境变量测试 ===')
    
    // 检查所有环境变量
    const allKeys = Object.keys(process.env)
    const nextPublicKeys = allKeys.filter(key => key.startsWith('NEXT_PUBLIC_'))
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    const result = {
      timestamp: new Date().toISOString(),
      totalEnvVars: allKeys.length,
      nextPublicCount: nextPublicKeys.length,
      nextPublicVars: nextPublicKeys,
      supabaseUrl: {
        value: supabaseUrl,
        length: supabaseUrl.length,
        exists: !!supabaseUrl,
        isEmpty: supabaseUrl === ''
      },
      supabaseKey: {
        exists: !!supabaseKey,
        length: supabaseKey.length,
        isEmpty: supabaseKey === ''
      },
      // 检查Vercel特定变量
      vercelVars: {
        url: process.env.NEXT_PUBLIC_VERCEL_URL || 'NOT_FOUND',
        env: process.env.NEXT_PUBLIC_VERCEL_ENV || 'NOT_FOUND',
        gitRepo: process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG || 'NOT_FOUND'
      }
    }
    
    setDiagnosis(result)
    
    console.log('动态渲染测试结果:', result)
    
    // 输出详细诊断
    console.log('🔍 详细诊断:')
    console.log('1. 总环境变量:', allKeys.length)
    console.log('2. NEXT_PUBLIC_ 变量:', nextPublicKeys)
    console.log('3. Supabase URL:', supabaseUrl || 'NOT_FOUND')
    console.log('4. Supabase URL 长度:', supabaseUrl.length)
    console.log('5. Supabase Key 存在:', !!supabaseKey)
    console.log('6. Supabase Key 长度:', supabaseKey.length)
    console.log('7. Vercel 变量:', result.vercelVars)
    
  }, [])
  
  if (!diagnosis) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>动态渲染环境变量测试</h1>
        <p>加载中...</p>
      </div>
    )
  }
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>动态渲染环境变量测试</h1>
      
      <div style={{ margin: '20px 0', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>测试说明</h3>
        <p>此页面使用 <code>export const dynamic = 'force-dynamic'</code> 强制动态渲染，避免静态生成问题。</p>
      </div>
      
      <h2>诊断结果</h2>
      
      <div style={{ margin: '15px 0' }}>
        <h3>环境变量统计</h3>
        <p>总环境变量: {diagnosis.totalEnvVars}</p>
        <p>NEXT_PUBLIC_ 变量: {diagnosis.nextPublicCount} 个</p>
        {diagnosis.nextPublicCount > 0 && (
          <div style={{ marginTop: '10px' }}>
            <p><strong>检测到的变量:</strong></p>
            <ul>
              {diagnosis.nextPublicVars.map((key: string, index: number) => (
                <li key={index}>{key}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div style={{ margin: '15px 0' }}>
        <h3>Supabase 配置</h3>
        <div style={{ 
          padding: '10px', 
          margin: '10px 0', 
          background: diagnosis.supabaseUrl.exists ? '#e8f5e8' : '#ffebee',
          borderRadius: '4px'
        }}>
          <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {diagnosis.supabaseUrl.exists ? '✅ 已设置' : '❌ 未找到'}</p>
          {diagnosis.supabaseUrl.exists && (
            <>
              <p>长度: {diagnosis.supabaseUrl.length} 字符</p>
              {diagnosis.supabaseUrl.isEmpty && <p style={{ color: '#f44336' }}>⚠️ 值为空字符串！</p>}
            </>
          )}
        </div>
        
        <div style={{ 
          padding: '10px', 
          margin: '10px 0', 
          background: diagnosis.supabaseKey.exists ? '#e8f5e8' : '#ffebee',
          borderRadius: '4px'
        }}>
          <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {diagnosis.supabaseKey.exists ? '✅ 已设置' : '❌ 未找到'}</p>
          {diagnosis.supabaseKey.exists && (
            <>
              <p>长度: {diagnosis.supabaseKey.length} 字符</p>
              {diagnosis.supabaseKey.isEmpty && <p style={{ color: '#f44336' }}>⚠️ 值为空字符串！</p>}
            </>
          )}
        </div>
      </div>
      
      <div style={{ margin: '15px 0' }}>
        <h3>Vercel 变量</h3>
        <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '4px' }}>
          <p>NEXT_PUBLIC_VERCEL_URL: {diagnosis.vercelVars.url}</p>
          <p>NEXT_PUBLIC_VERCEL_ENV: {diagnosis.vercelVars.env}</p>
          <p>NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG: {diagnosis.vercelVars.gitRepo}</p>
        </div>
      </div>
      
      <div style={{ margin: '20px 0', padding: '15px', background: '#fff3e0', borderRadius: '8px' }}>
        <h3>💡 问题诊断</h3>
        
        {diagnosis.nextPublicCount === 0 ? (
          <div>
            <p style={{ color: '#f44336' }}><strong>❌ 关键问题：没有检测到任何 NEXT_PUBLIC_ 环境变量</strong></p>
            <p>这意味着 Vercel 没有将环境变量注入到客户端代码中。</p>
            <p><strong>可能原因：</strong></p>
            <ul>
              <li>Vercel 环境变量配置有问题</li>
              <li>Next.js 构建时环境变量不可用</li>
              <li>需要检查 Vercel 构建日志</li>
            </ul>
          </div>
        ) : diagnosis.supabaseUrl.exists ? (
          <div>
            <p style={{ color: '#4caf50' }}><strong>✅ 环境变量检测正常</strong></p>
            <p>Supabase 环境变量已正确检测到。问题可能在 Supabase 客户端初始化逻辑中。</p>
          </div>
        ) : (
          <div>
            <p style={{ color: '#ff9800' }}><strong>⚠️ 部分问题：检测到 {diagnosis.nextPublicCount} 个 NEXT_PUBLIC_ 变量，但 Supabase 变量缺失</strong></p>
            <p>Vercel 成功注入了环境变量，但 Supabase 变量未包含在内。</p>
            <p><strong>解决方案：</strong></p>
            <ol>
              <li>检查 Vercel 环境变量名称是否正确</li>
              <li>确保变量值不为空</li>
              <li>重新部署项目</li>
            </ol>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
        <h3>控制台输出</h3>
        <p>详细诊断信息已输出到浏览器控制台（F12 → Console）</p>
        <button 
          onClick={() => {
            console.log('=== 手动重新测试 ===', diagnosis)
            alert('诊断结果已打印到控制台')
          }}
          style={{
            padding: '8px 15px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          在控制台打印当前结果
        </button>
      </div>
    </div>
  )
}