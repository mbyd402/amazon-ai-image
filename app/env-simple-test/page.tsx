'use client'

import { useEffect } from 'react'

export default function EnvSimpleTestPage() {
  useEffect(() => {
    // 最简单的环境变量测试
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('=== 简单环境变量测试 ===')
    console.log('Supabase URL:', supabaseUrl || 'NOT FOUND')
    console.log('Supabase Key:', supabaseKey ? 'SET (hidden)' : 'NOT FOUND')
    console.log('URL Length:', supabaseUrl?.length || 0)
    console.log('Key Length:', supabaseKey?.length || 0)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('=== 结束测试 ===')
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>环境变量简单测试</h1>
      <p>查看浏览器控制台 (F12 → Console) 查看结果</p>
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>测试结果：</h3>
        <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置'}</p>
        <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置'}</p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <a href="/" style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
          返回首页
        </a>
      </div>
    </div>
  )
}