'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Bell, Clock, Database, Info, ChevronRight, Palette, Volume2 } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

/**
 * 设置页面 - iOS Settings 风格
 */
export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    // 检查系统主题偏好
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(isDark)
  }, [])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    // 这里可以添加切换主题的逻辑
    document.documentElement.classList.toggle('dark')
  }

  const settings = [
    {
      section: '外观',
      items: [
        {
          title: '深色模式',
          description: '使用深色主题保护眼睛',
          icon: Moon,
          action: 'toggle',
          value: darkMode,
          onChange: toggleTheme,
        },
        {
          title: '主题颜色',
          description: '自定义应用主题',
          icon: Palette,
          action: 'link',
          href: '/settings/theme',
        },
      ],
    },
    {
      section: '通知',
      items: [
        {
          title: '专注提醒',
          description: '开始番茄钟时发送通知',
          icon: Bell,
          action: 'toggle',
          value: notifications,
          onChange: () => setNotifications(!notifications),
        },
        {
          title: '提醒音效',
          description: '播放提示音',
          icon: Volume2,
          action: 'toggle',
          value: soundEnabled,
          onChange: () => setSoundEnabled(!soundEnabled),
        },
      ],
    },
    {
      section: '番茄钟',
      items: [
        {
          title: '专注时长',
          description: '25 分钟',
          icon: Clock,
          action: 'link',
          href: '/settings/timer',
        },
        {
          title: '短休息',
          description: '5 分钟',
          icon: Clock,
          action: 'link',
          href: '/settings/break',
        },
        {
          title: '长休息',
          description: '15 分钟',
          icon: Clock,
          action: 'link',
          href: '/settings/long-break',
        },
      ],
    },
    {
      section: '数据',
      items: [
        {
          title: '导出数据',
          description: '导出学习记录',
          icon: Database,
          action: 'link',
          href: '/settings/export',
        },
        {
          title: '清理缓存',
          description: '释放存储空间',
          icon: Database,
          action: 'button',
        },
      ],
    },
    {
      section: '关于',
      items: [
        {
          title: '版本信息',
          description: 'v2.0.0',
          icon: Info,
          action: 'link',
          href: '/settings/about',
        },
      ],
    },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">设置</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">自定义你的应用</p>
      </div>

      {/* 设置列表 */}
      {settings.map((section) => (
        <div key={section.section} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
            {section.section}
          </h2>

          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm">
            {section.items.map((item, index) => (
              <div
                key={item.title}
                className={`
                  flex items-center justify-between px-4 py-4
                  ${index !== section.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}
                  ${item.action === 'link' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
                  ${item.action === 'button' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
                  transition-colors
                `}
              >
                {/* 左侧图标和文字 */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* 右侧操作 */}
                {item.action === 'toggle' && 'value' in item && 'onChange' in item && (
                  <button
                    onClick={item.onChange as () => void}
                    className={`
                      w-12 h-7 rounded-full p-1 transition-colors duration-200
                      ${item.value ? 'bg-[#60a5fa]' : 'bg-gray-300 dark:bg-gray-700'}
                    `}
                  >
                    <div
                      className={`
                        w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
                        ${item.value ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                )}

                {item.action === 'link' && (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}

                {item.action === 'button' && (
                  <span className="text-sm text-[#60a5fa] font-medium">
                    点击清理
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 底部提示 */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>考研番茄钟 v2.0.0</p>
        <p className="mt-1">为考研学子打造的高效学习工具</p>
      </div>
    </div>
  )
}
