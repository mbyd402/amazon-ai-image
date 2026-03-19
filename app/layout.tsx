import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Amazon AI Image Tools - AI Background, Watermark Remover, Upscale & Compliance Check',
  description: 'One-stop AI image tools for Amazon sellers. Create pure white background, remove watermark/text/logo, upscale image, check compliance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
