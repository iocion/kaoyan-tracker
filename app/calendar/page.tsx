'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * 日历页面 - 精简版
 */
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [stats, setStats] = useState({ pomodoros: 0, tasks: 0 })

  useEffect(() => {
    // 加载当月数据
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    
    fetch(`/api/stats?year=${year}&month=${month}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats({
            pomodoros: data.data?.totalPomodoros || 0,
            tasks: data.data?.completedTasks || 0
          })
        }
      })
  }, [currentDate])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
    '七月', '八月', '九月', '十月', '十一月', '十二月']

  const prevMonth = () => setCurrentDate(new Date(year, month - 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1))

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">学习日历</h1>

      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-4 shadow-sm">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-lg font-semibold">{year}年 {monthNames[month]}</div>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 日历网格 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-center text-sm text-gray-500 py-2">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isToday = day === new Date().getDate() && 
              month === new Date().getMonth() && 
              year === new Date().getFullYear()
            
            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                  isToday ? 'bg-[#60a5fa] text-white' : 'hover:bg-gray-100'
                }`}
              >
                {day}
              </div>
            )
          })}
        </div>
      </div>

      {/* 月度统计 */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-[#60a5fa]">{stats.pomodoros}</div>
          <div className="text-sm text-gray-500">本月番茄钟</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-[#8b5cf6]">{stats.tasks}</div>
          <div className="text-sm text-gray-500">本月完成任务</div>
        </div>
      </div>
    </div>
  )
}
