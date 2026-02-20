import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { MobileNavigation } from '@/components/MobileNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '考研番茄钟',
  description: 'Apple 风格的原生考研番茄钟应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-[#fafafa] dark:bg-[#0a0a0a]`}>
        <div className="flex h-screen">
          {/* 桌面端侧边栏 */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* 主内容区域 */}
          <main className="flex-1 md:ml-64 overflow-auto pb-20 md:pb-8">
            <div className="min-h-screen p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>

        {/* 移动端底部导航 */}
        <MobileNavigation />
      </body>
    </html>
  )
}
