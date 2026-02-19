import { NextRequest, NextResponse } from 'next/server'
import { StatsService } from '@/lib/services/stats.service'
import { statsQuerySchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stats
 * 获取统计数据
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // 验证查询参数
    const validated = statsQuerySchema.parse({
      period: searchParams.get('period') || 'week',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined
    })

    const period = validated.period as 'today' | 'week' | 'month'

    // 获取统计数据
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

/**
 * GET /api/stats/heatmap
 * 获取热力图数据
 */
export async function GET_HEATMAP(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const heatmapData = await StatsService.getHeatmapData(year)

    return NextResponse.json({
      success: true,
      data: heatmapData
    })
  } catch (error) {
    console.error('[API] Get heatmap error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取热力图数据失败'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/stats/daily
 * 获取每日详细数据
 */
export async function GET_DAILY(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7')

    const dailyData = await StatsService.getDailyData(days)

    return NextResponse.json({
      success: true,
      data: dailyData
    })
  } catch (error) {
    console.error('[API] Get daily stats error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取每日数据失败'
      },
      { status: 500 }
    )
  }
}
