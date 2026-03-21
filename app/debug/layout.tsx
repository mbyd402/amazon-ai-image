import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '调试工具 - Amazon AI 图片处理',
  description: 'Supabase连接诊断和性能调试工具',
}

export default function DebugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}