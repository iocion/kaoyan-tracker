import Link from 'next/link'
import { Timer, BarChart3, List, Settings } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

/**
 * 首页 - 精简版
 * 只保留已实现功能的入口
 */
export default function HomePage() {
  const apps = [
    {
      name: '番茄钟',
      icon: Timer,
      href: '/timer',
      color: colors.primary,
      desc: '开始专注学习'
    },
    {
      name: '任务',
      icon: List,
      href: '/tasks',
      color: colors.subjectMath,
      desc: '管理学习任务'
    },
    {
      name: '统计',
      icon: BarChart3,
      href: '/records',
      color: colors.subjectEnglish,
      desc: '查看学习数据'
    },
    {
      name: '设置',
      icon: Settings,
      href: '/settings',
      color: colors.textSecondary,
      desc: '应用设置'
    }
  ]

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">考研番茄钟</h1>
        <p className="text-gray-500 mt-1">高效学习，成就未来</p>
      </div>

      {/* 应用网格 */}
      <div className="grid grid-cols-2 gap-4">
        {apps.map((app) => (
          <Link
            key={app.name}
            href={app.href}
            className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: app.color }}
            >
              <app.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-medium">{app.name}</div>
              <div className="text-sm text-gray-500">{app.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* 快捷入口 */}
      <div className="mt-8">
        <Link
          href="/timer"
          className="block p-4 rounded-xl bg-[#60a5fa] text-white text-center hover:bg-[#3b82f6] transition-colors"
        >
          <div className="font-medium">开始专注</div>
          <div className="text-sm text-white/80">25分钟番茄钟</div>
        </Link>
      </div>
    </div>
  )
}
