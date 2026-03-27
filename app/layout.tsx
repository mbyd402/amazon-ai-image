import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Amazon Image Pro - Background, Watermark Remover, Upscale & Compliance Check',
  description: 'One-stop image tools for Amazon sellers. Create pure white background, remove watermark/text/logo, upscale image, check compliance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* 阻止MetaMask和其他钱包扩展干扰 */}
        <Script id="block-wallet-extensions" strategy="beforeInteractive">
          {`
            // 阻止常见的钱包注入
            const blockWallets = () => {
              // MetaMask
              if (typeof window.ethereum !== 'undefined') {
                console.warn('Wallet extension detected. This may interfere with normal operation.');
              }
              
              // 阻止window.ethereum的某些方法
              Object.defineProperty(window, 'ethereum', {
                get() {
                  console.log('Blocked access to ethereum object');
                  return null;
                },
                set() {},
                configurable: false
              });
            };
            
            // 页面加载时执行
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', blockWallets);
            } else {
              blockWallets();
            }
          `}
        </Script>
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
