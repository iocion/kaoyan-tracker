import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

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
          <Sidebar />
          <main className="flex-1 ml-64 overflow-auto">
            <div className="min-h-screen p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
