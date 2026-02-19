import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health
 * 健康检查端点
 */
export async function GET() {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: 'default' }
    })

    // 检查任务数量
    const taskCount = await prisma.task.count()

    // 检查番茄钟数量
    const pomodoroCount = await prisma.pomodoro.count()

    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        userExists: !!user,
        taskCount,
        pomodoroCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[Health] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '健康检查失败',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
