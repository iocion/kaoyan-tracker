'use client'

import { useState, useEffect } from 'react'
import { Home, Timer, BarChart3, List, Settings, PlusCircle, Clock, Calendar, TrendingUp, Moon } from 'lucide-react'
import { colors } from '@/lib/styles/colors'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * iOS 风格的侧边栏导航
 * 隐藏式设计，类似 iOS 控制中心
 */
export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 确保路径名匹配
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navItems = [
    {
      name: '首页',
      icon: Home,
      href: '/',
      active: isActive('/'),
    },
    {
      name: '番茄钟',
      icon: Timer,
      href: '/timer',
      active: isActive('/timer'),
    },
    {
      name: '统计',
      icon: BarChart3,
      href: '/records',
      active: isActive('/records'),
    },
    {
      name: '任务',
      icon: List,
      href: '/tasks',
      active: isActive('/tasks'),
    },
    {
      name: '设置',
      icon: Settings,
      href: '/settings',
      active: isActive('/settings'),
    },
  ]

  const toolsItems = [
    {
      name: '日历',
      icon: Calendar,
      href: '/calendar',
      active: false,
    },
    {
      name: '趋势',
      icon: TrendingUp,
      href: '/trends',
      active: false,
    },
    {
      name: '夜间模式',
      icon: Moon,
      action: 'toggle-theme',
    },
  ]

  return (
    <aside className={`
      fixed left-0 top-0 bottom-0 h-full
      z-50
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-64'}
      backdrop-blur-xl bg-white/80 dark:bg-black/80
      border-r border-black/10
      hidden md:block
    `}>
      {/* 顶部工具栏 */}
      <div className="p-4 border-b border-black/5">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl bg-black/10 hover:bg-black/20">
            <PlusCircle className="w-5 h-5 text-gray-500 hover:text-gray-400" />
          </button>

          <div className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
            考研番茄钟
          </div>

          <button className="p-2 rounded-xl bg-black/10 hover:bg-black/20">
            <Clock className="w-5 h-5 text-gray-500 hover:text-gray-400" />
          </button>
        </div>
      </div>

      {/* 导航链接 */}
      <div className="py-4 space-y-1">
        <div className="px-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl
                  transition-all duration-200
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  ${item.active
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <item.icon className={`
                  w-6 h-6
                  transition-colors duration-200
                  ${item.active ? 'text-[#60a5fa]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}
                `} />
                <span className={`
                  text-sm font-medium transition-colors duration-200
                  ${item.active ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400'}
                `}>
                  {item.name}
                </span>
                {item.active && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-[#60a5fa] animate-pulse" />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* 分隔线 */}
        {!isCollapsed && (
          <div className="mx-4 h-px bg-gray-200 dark:bg-gray-800" />
        )}

        {/* 工具 */}
        <div className="px-2">
          <div className="space-y-1">
            {toolsItems.map((item) => (
              <button
                key={item.name}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl
                  transition-all duration-200
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  text-left
                `}
              >
                <item.icon className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 底部设置 */}
      <div className="p-4 border-t border-black/5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        >
          <Settings className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            设置
          </span>
        </Link>
      </div>

      {/* 折叠/展开按钮 */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 z-50"
      >
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            d={isCollapsed ? "M9 18l6-6-6-6" : "M6 9l6 6 6-6"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </aside>
  )
}
