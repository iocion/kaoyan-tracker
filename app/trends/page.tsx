'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalPomodoros: number
  totalFocusTime: number
  completedTasks: number
}

/**
 * 趋势页面 - 精简版
 */
export default function TrendsPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.data)
      })
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">学习统计</h1>

      {stats ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-[#60a5fa]">{stats.totalPomodoros || 0}</div>
            <div className="text-sm text-gray-500">总番茄钟</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-[#8b5cf6]">{Math.floor((stats.totalFocusTime || 0) / 3600)}h</div>
            <div className="text-sm text-gray-500">专注时长</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-[#10b981]">{stats.completedTasks || 0}</div>
            <div className="text-sm text-gray-500">完成任务</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      )}
    </div>
  )
}
