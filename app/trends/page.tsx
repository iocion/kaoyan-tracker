'use client'

import { useState } from 'react'
import { TrendingUp, Clock, Target, Flame, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

/**
 * 趋势页面 - 学习进度追踪
 */
export default function TrendsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  const periods = [
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'year', label: '全年' },
  ]

  // 模拟趋势数据
  const trendData = [
    { day: '周一', value: 4, completed: 3 },
    { day: '周二', value: 5, completed: 5 },
    { day: '周三', value: 3, completed: 2 },
    { day: '周四', value: 6, completed: 6 },
    { day: '周五', value: 4, completed: 4 },
    { day: '周六', value: 7, completed: 6 },
    { day: '周日', value: 5, completed: 4 },
  ]

  const maxValue = Math.max(...trendData.map(d => d.value))

  const stats = [
    {
      title: '总番茄钟',
      value: '34',
      change: '+12%',
      positive: true,
      icon: Clock,
      color: colors.primary,
    },
    {
      title: '专注时长',
      value: '14h 10m',
      change: '+8%',
      positive: true,
      icon: TrendingUp,
      color: colors.subjectMath,
    },
    {
      title: '完成任务',
      value: '28',
      change: '+15%',
      positive: true,
      icon: Target,
      color: colors.subjectEnglish,
    },
    {
      title: '连续天数',
      value: '7',
      change: '+0',
      positive: true,
      icon: Flame,
      color: colors.success,
    },
  ]

  const subjects = [
    { name: '数学', value: 12, color: colors.subjectMath, progress: 80 },
    { name: '英语', value: 8, color: colors.subjectEnglish, progress: 60 },
    { name: '政治', value: 6, color: colors.subjectPolitics, progress: 45 },
    { name: '专业课', value: 8, color: colors.primary, progress: 55 },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">学习趋势</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">追踪你的学习进度</p>
      </div>

      {/* 时间周期选择 */}
      <div className="flex gap-2 mb-6">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value)}
            className={`
              flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${selectedPeriod === period.value
                ? 'bg-[#60a5fa] text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '20' }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              {stat.change !== '+0' && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.positive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              )}
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* 周期图表 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            每日番茄钟
          </span>
        </div>

        <div className="space-y-3">
          {trendData.map((data) => (
            <div key={data.day} className="flex items-center gap-3">
              <div className="w-8 text-xs text-gray-500 dark:text-gray-400">
                {data.day}
              </div>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#60a5fa] transition-all duration-500"
                    style={{ width: `${(data.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {data.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  / {data.completed}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 学科分布 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            学科分布
          </span>
        </div>

        <div className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {subject.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {subject.value} 番茄
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${subject.progress}%`,
                    backgroundColor: subject.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 学习建议 */}
      <div className="bg-gradient-to-br from-[#60a5fa] to-[#3b82f6] rounded-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold mb-1">学习建议</div>
            <div className="text-sm text-white/90">
              你的学习趋势非常好！建议在数学上投入更多时间，本周完成率提升明显，继续保持！
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
