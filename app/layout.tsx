import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '考研学习助手',
  description: '408考研学习追踪与统计',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-apple-gray-50">{children}</body>
    </html>
  )
}
