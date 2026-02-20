import Link from 'next/link'
import { Timer, BarChart3, List, Settings, PlusCircle, Calendar, TrendingUp, Moon } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

/**
 * Apple 风格首页 - iOS 主屏幕风格
 * 淡浅蓝色主题，类似 Foucs
 */
export default function HomePage() {
  const apps = [
    {
      name: '番茄钟',
      icon: Timer,
      href: '/timer',
      color: colors.primary,
      description: '25分钟专注学习',
    },
    {
      name: '统计',
      icon: BarChart3,
      href: '/records',
      color: colors.subjectMath,
      description: '学习数据分析',
    },
    {
      name: '任务',
      icon: List,
      href: '/tasks',
      color: colors.subjectEnglish,
      description: '管理考研任务',
    },
    {
      name: '日历',
      icon: Calendar,
      href: '/calendar',
      color: colors.subjectPolitics,
      description: '学习计划安排',
    },
    {
      name: '趋势',
      icon: TrendingUp,
      href: '/trends',
      color: colors.success,
      description: '学习进度追踪',
    },
    {
      name: '设置',
      icon: Settings,
      href: '/settings',
      color: colors.textSecondary,
      description: '应用偏好设置',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            考研番茄钟
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            高效学习，成就未来
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#60a5fa] text-white font-medium hover:bg-[#3b82f6] transition-colors">
          <PlusCircle className="w-5 h-5" />
          新任务
        </button>
      </div>

      {/* 应用网格 - iOS 风格 */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6">
        {apps.map((app) => (
          <Link
            key={app.name}
            href={app.href}
            className="group flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-200"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: app.color }}
            >
              <app.icon className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {app.name}
            </span>
          </Link>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          快捷操作
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/timer"
            className="flex items-center gap-4 p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-[#60a5fa] flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">开始专注</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">25分钟专注学习</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/records"
            className="flex items-center gap-4 p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6] flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">查看统计</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">今日学习数据分析</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* 今日统计卡片 */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '今日番茄', value: '4', color: colors.primary },
          { label: '专注时长', value: '2h', color: colors.subjectMath },
          { label: '完成任务', value: '3', color: colors.subjectEnglish },
          { label: '连续天数', value: '7', color: colors.subjectPolitics },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm"
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
