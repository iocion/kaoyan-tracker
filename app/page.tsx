'use client'

import { useState, useEffect } from 'react'
import { SubjectPieChart } from '@/components/charts/pie-chart'
import { formatHours, getSubjectColor, getSubjectName } from '@/lib/utils'
import { Clock, BookOpen, BarChart3, Play } from 'lucide-react'
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
    <div className="min-h-screen bg-apple-gray-50 pb-24">
      {/* 顶部标题 */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-10 border-b border-apple-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-apple-gray-900">考研学习助手</h1>
        </div>
      </div>
      
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 今日概览卡片 */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-6 text-white shadow-lg">
          <p className="text-white/80 text-sm font-medium mb-2">今日学习</p>
          
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-5xl font-bold">{Math.floor(todayHours)}</span>
            <span className="text-xl">小时</span>
            <span className="text-3xl font-bold">{Math.round((todayHours % 1) * 60)}</span>
            <span className="text-xl">分</span>
          </div>
          
          <div className="bg-white/20 rounded-full h-2 mb-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-white/80 text-sm">目标 {goalHours} 小时 · 已完成 {Math.round(progress)}%</p>
        </div>
        
        {/* 快捷操作 */}
        <div className="grid grid-cols-2 gap-4">
          <Link 
            href="/timer"
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-green-600 fill-current" />
            </div>
            <div>
              <p className="font-semibold text-apple-gray-900">开始学习</p>
              <p className="text-sm text-gray-500">记录专注时刻</p>
            </div>
          </Link>
          
          <Link 
            href="/records"
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-apple-gray-900">学习记录</p>
              <p className="text-sm text-gray-500">查看历史数据</p>
            </div>
          </Link>
        </div>
        
        {/* 学科统计 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-apple-gray-900 mb-4">今日学科分布</h2>
          
          {stats?.pieData && stats.pieData.length > 0 ? (
            <SubjectPieChart data={stats.pieData} /
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              今日暂无学习记录
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {subjects.map((sub) => (
              <div key={sub.key} className="bg-apple-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: sub.color }}
                  />
                  <span className="text-sm text-gray-600">{sub.name}</span>
                </div>
                <p className="text-xl font-bold" style={{ color: sub.color }}>
                  {formatHours(sub.hours)}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* 本周统计 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-apple-gray-900 mb-4">本周学习</h2>
          
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: '408', hours: stats?.hours408 || 0, color: '#3B82F6' },
              { label: '数学', hours: stats?.hoursMath || 0, color: '#10B981' },
              { label: '英语', hours: stats?.hoursEnglish || 0, color: '#F59E0B' },
              { label: '政治', hours: stats?.hoursPolitics || 0, color: '#EF4444' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-lg font-bold" style={{ color: item.color }}>
                  {Math.round(item.hours * 10) / 10}h
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-apple-gray-100">
        <div className="max-w-lg mx-auto flex justify-around py-3">
          <Link href="/" className="flex flex-col items-center px-4 text-primary-600">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">概览</span>
          </Link>
          <Link href="/timer" className="flex flex-col items-center px-4 text-gray-400">
            <Clock className="w-6 h-6" />
            <span className="text-xs mt-1">计时</span>
          </Link>
          <Link href="/records" className="flex flex-col items-center px-4 text-gray-400">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs mt-1">记录</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
