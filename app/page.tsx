'use client'

import { useState, useEffect } from 'react'
import { SubjectPieChart } from '@/components/charts/pie-chart'
import { formatHours, getSubjectColor, getSubjectName } from '@/lib/utils'
import { Clock, BookOpen, BarChart3, Play, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  hours408: number
  hoursMath: number
  hoursEnglish: number
  hoursPolitics: number
  pieData: Array<{ name: string; value: number; color: string }>
  todayStats: {
    totalHours: number
    hours408: number
    hoursMath: number
    hoursEnglish: number
    hoursPolitics: number
  }
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/statistics?period=week')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const todayHours = stats?.todayStats?.totalHours || 0
  const goalHours = 10
  const progress = Math.min((todayHours / goalHours) * 100, 100)

  const subjects = [
    { key: 'hours408', name: '408', color: '#3B82F6', hours: stats?.todayStats?.hours408 || 0 },
    { key: 'hoursMath', name: '数学', color: '#10B981', hours: stats?.todayStats?.hoursMath || 0 },
    { key: 'hoursEnglish', name: '英语', color: '#F59E0B', hours: stats?.todayStats?.hoursEnglish || 0 },
    { key: 'hoursPolitics', name: '政治', color: '#EF4444', hours: stats?.todayStats?.hoursPolitics || 0 },
  ]

  return (
    <div className="min-h-screen bg-apple-gray-50 pb-28">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-apple-gray-200">
        <div className="max-w-lg mx-auto px-5 py-4">
          <h1 className="text-2xl font-semibold text-apple-gray-900 tracking-tight">考研学习助手</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-28 pb-4 space-y-6">
        {/* 今日概览卡片 */}
        <div className="gradient-primary rounded-apple-xl p-7 text-white shadow-apple-lg">
          <p className="text-white/90 text-sm font-medium mb-3 tracking-wide">今日学习</p>

          <div className="flex items-baseline gap-1 mb-5">
            <span className="text-6xl font-semibold tracking-tight">{Math.floor(todayHours)}</span>
            <span className="text-xl font-medium">小时</span>
            <span className="text-3xl font-semibold">{Math.round((todayHours % 1) * 60)}</span>
            <span className="text-xl font-medium">分</span>
          </div>

          <div className="bg-white/20 rounded-full h-2.5 mb-3">
            <div
              className="bg-white h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-white/80 text-sm">目标 {goalHours} 小时 · 已完成 {Math.round(progress)}%</p>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/timer"
            className="gradient-card rounded-apple-sm p-5 shadow-apple-sm hover:shadow-apple transition-all duration-300 flex items-center gap-4 group"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Play className="w-7 h-7 text-primary-500 fill-current" />
            </div>
            <div>
              <p className="font-semibold text-apple-gray-900 text-base">开始学习</p>
              <p className="text-sm text-apple-gray-400 mt-0.5">记录专注时刻</p>
            </div>
          </Link>

          <Link
            href="/records"
            className="gradient-card rounded-apple-sm p-5 shadow-apple-sm hover:shadow-apple transition-all duration-300 flex items-center gap-4 group"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-7 h-7 text-primary-500" />
            </div>
            <div>
              <p className="font-semibold text-apple-gray-900 text-base">学习记录</p>
              <p className="text-sm text-apple-gray-400 mt-0.5">查看历史数据</p>
            </div>
          </Link>
        </div>

        {/* 学科统计 */}
        <div className="card-apple-lg p-6">
          <h2 className="text-lg font-semibold text-apple-gray-900 mb-5 tracking-tight">今日学科分布</h2>

          {stats?.pieData && stats.pieData.length > 0 ? (
            <SubjectPieChart data={stats.pieData} />
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <CheckCircle className="w-14 h-14 text-apple-gray-300 mx-auto mb-3" />
                <p className="text-apple-gray-500 font-medium">今日暂无学习记录</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-6">
            {subjects.map((sub) => (
              <div key={sub.key} className="bg-apple-gray-50 rounded-apple-sm p-4 hover:bg-apple-gray-100 transition-colors">
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: sub.color }}
                  />
                  <span className="text-sm font-medium text-apple-gray-700">{sub.name}</span>
                </div>
                <p className="text-2xl font-semibold tracking-tight" style={{ color: sub.color }}>
                  {formatHours(sub.hours)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 本周统计 */}
        <div className="card-apple-lg p-6">
          <h2 className="text-lg font-semibold text-apple-gray-900 mb-5 tracking-tight">本周学习</h2>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '408', hours: stats?.hours408 || 0, color: '#3B82F6' },
              { label: '数学', hours: stats?.hoursMath || 0, color: '#10B981' },
              { label: '英语', hours: stats?.hoursEnglish || 0, color: '#F59E0B' },
              { label: '政治', hours: stats?.hoursPolitics || 0, color: '#EF4444' },
            ].map((item) => (
              <div key={item.label} className="text-center py-3 rounded-apple-sm hover:bg-apple-gray-50 transition-colors">
                <p className="text-xs text-apple-gray-400 mb-2 font-medium">{item.label}</p>
                <p className="text-xl font-bold tracking-tight" style={{ color: item.color }}>
                  {Math.round(item.hours * 10) / 10}h
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-apple-gray-200">
        <div className="max-w-lg mx-auto flex justify-around py-3">
          <Link href="/" className="flex flex-col items-center px-5 py-2 rounded-xl transition-all duration-300 text-primary-600">
            <BarChart3 className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs mt-1 font-medium">概览</span>
          </Link>
          <Link href="/timer" className="flex flex-col items-center px-5 py-2 rounded-xl transition-all duration-300 text-apple-gray-400 hover:text-apple-gray-600">
            <Clock className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs mt-1 font-medium">计时</span>
          </Link>
          <Link href="/records" className="flex flex-col items-center px-5 py-2 rounded-xl transition-all duration-300 text-apple-gray-400 hover:text-apple-gray-600">
            <BookOpen className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs mt-1 font-medium">记录</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
