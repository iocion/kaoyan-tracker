import { NextRequest, NextResponse } from 'next/server'
import { StatsService } from '@/lib/services/stats.service'
import { statsQuerySchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stats?period=week&type=summary
 * GET /api/stats?period=week&type=pie
 * GET /api/stats?period=week&type=line
 * GET /api/stats?period=week&type=today
 * GET /api/stats?period=week&type=ranking
 * GET /api/stats?period=week&type=all (默认)
 * GET /api/stats?year=2024&type=heatmap
 * GET /api/stats?days=7&type=daily
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all'

    // 热力图数据
    if (type === 'heatmap') {
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
      const heatmapData = await StatsService.getHeatmapData(year)

      return NextResponse.json({
        success: true,
        data: heatmapData
      })
    }

    // 每日详细数据
    if (type === 'daily') {
      const days = parseInt(searchParams.get('days') || '7')
      const dailyData = await StatsService.getDailyData(days)

      return NextResponse.json({
        success: true,
        data: dailyData
      })
    }

    // 验证查询参数
    const validated = statsQuerySchema.parse({
      period: searchParams.get('period') || 'week',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined
    })

    const period = validated.period as 'today' | 'week' | 'month'

    // 单个数据类型
    if (type === 'summary') {
      const summary = await StatsService.getSummary(period)
      return NextResponse.json({ success: true, data: summary })
    }

    if (type === 'pie') {
      const pieData = await StatsService.getPieData(period)
      return NextResponse.json({ success: true, data: pieData })
    }

    if (type === 'line') {
      const lineData = await StatsService.getLineData(period)
      return NextResponse.json({ success: true, data: lineData })
    }

    if (type === 'today') {
      const todayStats = await StatsService.getToday()
      return NextResponse.json({ success: true, data: todayStats })
    }

    if (type === 'ranking') {
      const subjectRanking = await StatsService.getSubjectRanking(period)
      return NextResponse.json({ success: true, data: subjectRanking })
    }

    // 默认返回所有数据
    const summary = await StatsService.getSummary(period)
    const pieData = await StatsService.getPieData(period)
    const lineData = await StatsService.getLineData(period)
    const todayStats = await StatsService.getToday()
    const subjectRanking = await StatsService.getSubjectRanking(period)

    return NextResponse.json({
      success: true,
      data: {
        summary,
        pieData,
        lineData,
        todayStats,
        subjectRanking
      }
    })
  } catch (error: any) {
    console.error('[API] Get stats error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: '参数验证失败',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: '获取统计数据失败'
      },
      { status: 500 }
    )
  }
}
