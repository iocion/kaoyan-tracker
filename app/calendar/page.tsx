'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, Target, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

/**
 * 日历页面 - iOS Calendar 风格
 */
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // 获取月份天数
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const dayNames = ['日', '一', '二', '三', '四', '五', '六']

  // 模拟每日数据
  const getDayData = (day: number) => {
    const randomSeed = day + currentDate.getMonth()
    const hasData = randomSeed % 3 !== 0
    const pomodoros = hasData ? (randomSeed % 8) + 1 : 0
    const completed = randomSeed % 2 === 0

    return { hasData, pomodoros, completed }
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isSameDate = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    )
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const selectedDateData = getDayData(selectedDate.getDate())

  return (
    <div className="max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">学习日历</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">查看你的学习进度</p>
      </div>

      {/* 日历导航 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm mb-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={previousMonth}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
          </div>

          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 p-4 pb-0">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1 p-4">
          {/* 空白天数 */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {/* 日期 */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const dayData = getDayData(day)
            const today = isToday(day)
            const selected = isSameDate(day)

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center
                  transition-all duration-200 relative
                  ${selected
                    ? 'bg-[#60a5fa] text-white'
                    : today
                    ? 'bg-[#60a5fa]/10 text-[#60a5fa]'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <span className="text-sm font-medium">
                  {day}
                </span>
                {dayData.hasData && (
                  <div
                    className={`
                      absolute bottom-1 flex gap-0.5
                      ${selected ? 'opacity-100' : 'opacity-60'}
                    `}
                  >
                    {Array.from({ length: Math.min(dayData.pomodoros, 3) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: selected ? 'white' : colors.primary }}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 选中日期详情 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#60a5fa] flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {selectedDate.getMonth() + 1}月 {selectedDate.getDate()}日
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isToday(selectedDate.getDate()) ? '今天' : '过去'}
            </div>
          </div>
        </div>

        {selectedDateData.hasData ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Clock className="w-5 h-5 text-[#60a5fa]" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  专注时长
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedDateData.pomodoros} 个番茄钟
                </div>
              </div>
              <div className="text-lg font-bold text-[#60a5fa]">
                {selectedDateData.pomodoros * 25}m
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Target className="w-5 h-5 text-[#8b5cf6]" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  完成任务
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedDateData.completed ? '全部完成' : '部分完成'}
                </div>
              </div>
              {selectedDateData.completed && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              这一天没有学习记录
            </div>
          </div>
        )}
      </div>

      {/* 本周统计 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            本周统计
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '总番茄', value: '23', color: colors.primary },
            { label: '专注时长', value: '9h 35m', color: colors.subjectMath },
            { label: '连续天数', value: '7', color: colors.success },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
            >
              <div className="text-lg font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TrendingUp(props: any) {
  return null
}
