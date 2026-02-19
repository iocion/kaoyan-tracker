import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'
    
    const userId = 'default'
    
    // 计算日期范围
    const startDate = new Date()
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }
    
    // 获取统计数据
    const stats = await prisma.dailyStatistic.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    })
    
    // 汇总
    const hours408 = stats.reduce((sum, s) => sum + s.hours408, 0)
    const hoursMath = stats.reduce((sum, s) => sum + s.hoursMath, 0)
    const hoursEnglish = stats.reduce((sum, s) => sum + s.hoursEnglish, 0)
    const hoursPolitics = stats.reduce((sum, s) => sum + s.hoursPolitics, 0)
    
    // 扇形图数据
    const pieData = [
      { name: '408', value: hours408, color: '#3B82F6' },
      { name: '数学', value: hoursMath, color: '#10B981' },
      { name: '英语', value: hoursEnglish, color: '#F59E0B' },
      { name: '政治', value: hoursPolitics, color: '#EF4444' },
    ].filter(d => d.value > 0)
    
    // 今日数据
    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)
    
    const todayStats = await prisma.dailyStatistic.findFirst({
      where: {
        userId,
        date: { gte: todayStart, lte: todayEnd },
      },
    })
    
    return NextResponse.json({
      hours408,
      hoursMath,
      hoursEnglish,
      hoursPolitics,
      pieData,
      todayStats: todayStats || {
        totalHours: 0,
        hours408: 0,
        hoursMath: 0,
        hoursEnglish: 0,
        hoursPolitics: 0,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({
      hours408: 0,
      hoursMath: 0,
      hoursEnglish: 0,
      hoursPolitics: 0,
      pieData: [],
      todayStats: {
        totalHours: 0,
        hours408: 0,
        hoursMath: 0,
        hoursEnglish: 0,
        hoursPolitics: 0,
      },
    })
  }
}
