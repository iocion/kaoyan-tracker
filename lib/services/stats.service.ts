import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { Subject, StatSummary, PieChartData, ChartDataPoint } from '@/types'

/**
 * 统计服务
 * 封装所有统计数据相关的业务逻辑
 */
export class StatsService {
  private static readonly DEFAULT_USER_ID = 'default'

  /**
   * 获取统计摘要
   */
  static async getSummary(period: 'today' | 'week' | 'month' = 'week'): Promise<StatSummary> {
    const { startDate, endDate } = this.getDateRange(period)

    const stats = await prisma.dailyStat.findMany({
      where: {
        userId: this.DEFAULT_USER_ID,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'asc' }
    })

    const totalPomodoros = stats.reduce((sum, s) => sum + s.totalPomodoros, 0)
    const totalFocusTime = stats.reduce((sum, s) => sum + s.totalFocusTime, 0)
    const totalHours = totalFocusTime / 3600 // 转换为小时

    const completedTasks = stats.reduce((sum, s) => sum + s.completedTasks, 0)
    const createdTasks = stats.reduce((sum, s) => sum + s.createdTasks, 0)

    const bySubject: Record<Subject, { pomodoros: number; hours: number }> = {
      [Subject.COMPUTER_408]: {
        pomodoros: stats.reduce((sum, s) => sum + s.pomodoros408, 0),
        hours: 0
      },
      [Subject.MATH]: {
        pomodoros: stats.reduce((sum, s) => sum + s.pomodorosMath, 0),
        hours: 0
      },
      [Subject.ENGLISH]: {
        pomodoros: stats.reduce((sum, s) => sum + s.pomodorosEnglish, 0),
        hours: 0
      },
      [Subject.POLITICS]: {
        pomodoros: stats.reduce((sum, s) => sum + s.pomodorosPolitics, 0),
        hours: 0
      }
    }

    // 估算各学科时长（按比例分配）
    if (totalFocusTime > 0) {
      const totalPomodorosAll = Object.values(bySubject).reduce((sum, s) => sum + s.pomodoros, 0)
      if (totalPomodorosAll > 0) {
        Object.keys(bySubject).forEach((subject: string) => {
          const subjectKey = subject as Subject
          const ratio = bySubject[subjectKey].pomodoros / totalPomodorosAll
          bySubject[subjectKey].hours = (totalHours * ratio)
        })
      }
    }

    return {
      period,
      totalPomodoros,
      totalHours: Math.round(totalHours * 100) / 100,
      bySubject,
      tasks: {
        completed: completedTasks,
        created: createdTasks
      }
    }
  }

  /**
   * 获取扇形图数据
   */
  static async getPieData(period: 'today' | 'week' | 'month' = 'week'): Promise<PieChartData[]> {
    const summary = await this.getSummary(period)
    const colors: Record<Subject, string> = {
      [Subject.COMPUTER_408]: '#3B82F6',
      [Subject.MATH]: '#10B981',
      [Subject.ENGLISH]: '#F59E0B',
      [Subject.POLITICS]: '#EF4444'
    }

    const data: PieChartData[] = [
      {
        name: '408',
        value: summary.bySubject[Subject.COMPUTER_408].pomodoros,
        color: colors[Subject.COMPUTER_408]
      },
      {
        name: '数学',
        value: summary.bySubject[Subject.MATH].pomodoros,
        color: colors[Subject.MATH]
      },
      {
        name: '英语',
        value: summary.bySubject[Subject.ENGLISH].pomodoros,
        color: colors[Subject.ENGLISH]
      },
      {
        name: '政治',
        value: summary.bySubject[Subject.POLITICS].pomodoros,
        color: colors[Subject.POLITICS]
      }
    ].filter(d => d.value > 0)

    return data
  }

  /**
   * 获取折线图数据
   */
  static async getLineData(period: 'today' | 'week' | 'month' = 'week'): Promise<ChartDataPoint[]> {
    const { startDate, endDate, days } = this.getDateRange(period)

    const stats = await prisma.dailyStat.findMany({
      where: {
        userId: this.DEFAULT_USER_ID,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'asc' }
    })

    // 创建日期映射
    const dataMap = new Map<string, number>()
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, days - 1 - i)
      const dateStr = startOfDay(date).toISOString().split('T')[0]
      dataMap.set(dateStr, 0)
    }

    // 填充实际数据
    stats.forEach(stat => {
      const dateStr = startOfDay(stat.date).toISOString().split('T')[0]
      const hours = stat.totalFocusTime / 3600
      if (dataMap.has(dateStr)) {
        dataMap.set(dateStr, Math.round(hours * 100) / 100)
      }
    })

    // 转换为数组
    const data: ChartDataPoint[] = Array.from(dataMap.entries()).map(([date, value]) => ({
      date,
      value,
      label: date.slice(5) // 只显示 MM-DD
    }))

    return data
  }

  /**
   * 获取今日统计
   */
  static async getToday(): Promise<StatSummary> {
    return await this.getSummary('today')
  }

  /**
   * 获取每日详细数据
   */
  static async getDailyData(days: number = 7): Promise<Array<{
    date: string
    pomodoros: number
    hours: number
    tasksCompleted: number
  }>> {
    const startDate = startOfDay(subDays(new Date(), days - 1))
    const endDate = endOfDay(new Date())

    const stats = await prisma.dailyStat.findMany({
      where: {
        userId: this.DEFAULT_USER_ID,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'asc' }
    })

    // 补齐所有日期
    const dataMap = new Map<string, { pomodoros: number; hours: number; tasksCompleted: number }>()
    for (let i = 0; i < days; i++) {
      const date = startOfDay(subDays(endDate, days - 1 - i))
      dataMap.set(date.toISOString().split('T')[0], {
        pomodoros: 0,
        hours: 0,
        tasksCompleted: 0
      })
    }

    // 填充实际数据
    stats.forEach(stat => {
      const dateStr = startOfDay(stat.date).toISOString().split('T')[0]
      if (dataMap.has(dateStr)) {
        dataMap.set(dateStr, {
          pomodoros: stat.totalPomodoros,
          hours: Math.round((stat.totalFocusTime / 3600) * 100) / 100,
          tasksCompleted: stat.completedTasks
        })
      }
    })

    // 转换为数组
    const data = Array.from(dataMap.entries()).map(([date, values]) => ({
      date,
      ...values
    }))

    return data
  }

  /**
   * 获取日期范围
   */
  private static getDateRange(period: 'today' | 'week' | 'month'): {
    startDate: Date
    endDate: Date
    days: number
  } {
    const now = new Date()
    let startDate: Date
    let endDate: Date
    let days: number

    switch (period) {
      case 'today':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        days = 1
        break
      case 'week':
        startDate = startOfDay(subDays(now, 6))
        endDate = endOfDay(now)
        days = 7
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        break
    }

    return { startDate, endDate, days }
  }

  /**
   * 获取学科排名
   */
  static async getSubjectRanking(period: 'today' | 'week' | 'month' = 'week'): Promise<Array<{
    subject: Subject
    pomodoros: number
    hours: number
  }>> {
    const summary = await this.getSummary(period)

    const ranking = Object.entries(summary.bySubject)
      .map(([subject, data]) => ({
        subject: subject as Subject,
        pomodoros: data.pomodoros,
        hours: Math.round(data.hours * 100) / 100
      }))
      .sort((a, b) => b.pomodoros - a.pomodoros)

    return ranking
  }

  /**
   * 获取热力图数据（GitHub 风格）
   */
  static async getHeatmapData(year: number = new Date().getFullYear()): Promise<Array<{
    date: string
    level: number
  }>> {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

    const stats = await prisma.dailyStat.findMany({
      where: {
        userId: this.DEFAULT_USER_ID,
        date: { gte: startDate, lte: endDate }
      },
      select: {
        date: true,
        totalPomodoros: true
      }
    })

    const data = stats.map(stat => {
      const dateStr = startOfDay(stat.date).toISOString().split('T')[0]
      const pomodoros = stat.totalPomodoros

      // 计算热度等级 (0-4)
      let level = 0
      if (pomodoros > 0) level = 1
      if (pomodoros > 4) level = 2
      if (pomodoros > 8) level = 3
      if (pomodoros > 12) level = 4

      return {
        date: dateStr,
        level
      }
    })

    return data
  }
}
