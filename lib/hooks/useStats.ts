import { useState, useEffect, useCallback } from 'react'
import { StatSummary, PieChartData, ChartDataPoint } from '@/types'

interface UseStatsOptions {
  period?: 'today' | 'week' | 'month'
}

interface UseStatsReturn {
  summary: StatSummary | null
  pieData: PieChartData[]
  lineData: ChartDataPoint[]
  todayStats: StatSummary | null
  subjectRanking: Array<{
    subject: string
    pomodoros: number
    hours: number
  }>
  isLoading: boolean

  // 操作
  refresh: () => Promise<void>
  changePeriod: (period: 'today' | 'week' | 'month') => void
}

/**
 * 统计数据 Hook
 * 管理统计数据
 */
export function useStats(options: UseStatsOptions = {}): UseStatsReturn {
  const { period: initialPeriod = 'week' } = options

  const [summary, setSummary] = useState<StatSummary | null>(null)
  const [pieData, setPieData] = useState<PieChartData[]>([])
  const [lineData, setLineData] = useState<ChartDataPoint[]>([])
  const [todayStats, setTodayStats] = useState<StatSummary | null>(null)
  const [subjectRanking, setSubjectRanking] = useState<Array<{
    subject: string
    pomodoros: number
    hours: number
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPeriod, setCurrentPeriod] = useState<'today' | 'week' | 'month'>(initialPeriod)

  // 刷新统计数据
  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stats?period=${currentPeriod}`)
      const result = await response.json()

      if (result.success) {
        setSummary(result.data.summary)
        setPieData(result.data.pieData)
        setLineData(result.data.lineData)
        setTodayStats(result.data.todayStats)
        setSubjectRanking(result.data.subjectRanking)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPeriod])

  // 切换时间周期
  const changePeriod = useCallback((period: 'today' | 'week' | 'month') => {
    setCurrentPeriod(period)
  }, [])

  // 初始加载
  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    summary,
    pieData,
    lineData,
    todayStats,
    subjectRanking,
    isLoading,
    refresh,
    changePeriod
  }
}
