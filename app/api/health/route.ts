import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health
 * 健康检查端点
 */
export async function GET() {
  // 构建时跳过，避免直接实例化 PrismaClient
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: 'Database connection not configured. Set POSTGRES_URL or DATABASE_URL.'
    }, { status: 500 })
  }

  const { prisma } = await import('@/lib/prisma')

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
