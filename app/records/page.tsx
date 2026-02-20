'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, Calendar, Clock, Target, Award } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

/**
 * Apple 风格统计页面
 * iOS 卡片风格，简洁美观
 */
export default function RecordsPage() {
  const [period, setPeriod] = useState('week')

  const stats = [
    { label: '总番茄数', value: '156', icon: Target, color: colors.primary },
    { label: '总时长', value: '65h', icon: Clock, color: colors.subjectMath },
    { label: '连续天数', value: '12', icon: Calendar, color: colors.success },
    { label: '完成任务', value: '23', icon: Award, color: colors.subjectEnglish },
  ]

  const subjectStats = [
    { subject: '408', count: 45, hours: 18.75, color: colors.subject408 },
    { subject: '数学', count: 38, hours: 15.83, color: colors.subjectMath },
    { subject: '英语', count: 32, hours: 13.33, color: colors.subjectEnglish },
    { subject: '政治', count: 41, hours: 17.08, color: colors.subjectPolitics },
  ]

  const weeklyData = [
    { day: '周一', hours: 3.5 },
    { day: '周二', hours: 4.2 },
    { day: '周三', hours: 2.8 },
    { day: '周四', hours: 5.1 },
    { day: '周五', hours: 3.9 },
    { day: '周六', hours: 6.2 },
    { day: '周日', hours: 4.5 },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">学习统计</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">追踪进度，量化成长</p>
        </div>

        {/* 时间周期选择 */}
        <div className="flex bg-white dark:bg-gray-900 rounded-full p-1 shadow-sm">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                period === p
                  ? 'bg-[#60a5fa] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {p === 'week' && '本周'}
              {p === 'month' && '本月'}
              {p === 'year' && '本年'}
            </button>
          ))}
        </div>
      </div>

      {/* 核心统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* 学科分布 */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">学科分布</h2>
          <button className="text-[#60a5fa] hover:text-[#3b82f6] text-sm font-medium">查看详情</button>
        </div>

        <div className="space-y-4">
          {subjectStats.map((item) => (
            <div key={item.subject} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: item.color }}>
                {item.subject === '408' ? '408' : item.subject.charAt(0)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.subject === '408' ? '计算机408' : item.subject}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.count} 个番茄 · {item.hours} 小时
                  </span>
                </div>

                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.count / 50) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 学习趋势 */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#60a5fa]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#60a5fa]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">学习趋势</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">本周平均每日 4.3 小时</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-500">
            <TrendingUp className="w-4 h-4" />
            <span>+23%</span>
          </div>
        </div>

        {/* 柱状图 */}
        <div className="flex items-end justify-between h-48 gap-2">
          {weeklyData.map((day, index) => {
            const maxHours = Math.max(...weeklyData.map(d => d.hours))
            const height = (day.hours / maxHours) * 100

            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative">
                  <div
                    className="w-full rounded-t-xl transition-all duration-500 hover:opacity-80"
                    style={{
                      height: `${height}%`,
                      backgroundColor: index === 5 ? colors.primary : `${colors.primary}60`,
                      minHeight: '4px'
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{day.day}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
