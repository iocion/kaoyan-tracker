'use client'

import { Home, Timer, BarChart3, List, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { colors } from '@/lib/styles/colors'

/**
 * iOS 风格的移动端底部导航栏
 * 类似 iPhone 原生应用的设计
 */
export function MobileNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      name: '首页',
      icon: Home,
      href: '/',
      color: colors.primary,
    },
    {
      name: '番茄钟',
      icon: Timer,
      href: '/timer',
      color: colors.subjectMath,
    },
    {
      name: '统计',
      icon: BarChart3,
      href: '/records',
      color: colors.subjectEnglish,
    },
    {
      name: '任务',
      icon: List,
      href: '/tasks',
      color: colors.subjectPolitics,
    },
    {
      name: '设置',
      icon: Settings,
      href: '/settings',
      color: colors.textSecondary,
    },
  ]

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      bg-white/90 dark:bg-black/90
      backdrop-blur-xl
      border-t border-black/10
      pb-safe
      md:hidden
    ">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full relative"
            >
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 rounded-full" style={{ backgroundColor: item.color }} />
              )}
              <item.icon
                className={`w-6 h-6 mb-1 transition-all duration-200 ${
                  isActive ? 'scale-110' : 'scale-100 opacity-60'
                }`}
                style={{ color: isActive ? item.color : 'inherit' }}
              />
              <span className={`text-xs font-medium transition-colors duration-200 ${
                isActive ? 'opacity-100' : 'opacity-60'
              }`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
