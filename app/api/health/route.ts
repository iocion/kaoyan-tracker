import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health
 * 健康检查端点
 */
export async function GET() {
  try {
    // 检查环境变量
    if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: '数据库连接未配置',
        details: '请在 Vercel 项目设置中添加 POSTGRES_PRISMA_URL 或 DATABASE_URL'
      }, { status: 500 })
    }

    const { prisma } = await import('@/lib/prisma')

    // 测试数据库连接
    try {
      await prisma.$connect()
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: '数据库连接失败',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 })
    }

    // 检查用户
    let userExists = false
    let taskCount = 0
    let pomodoroCount = 0

    try {
      // 检查用户是否存在
      const user = await prisma.user.findUnique({
        where: { id: 'default' }
      })
      userExists = !!user

      // 检查任务数量
      taskCount = await prisma.task.count({
        where: { userId: 'default' }
      })

      // 检查番茄钟数量
      pomodoroCount = await prisma.pomodoro.count({
        where: { userId: 'default' }
      })
    } catch (error) {
      console.error('[Health] Database query error:', error)
      // 继续尝试其他检查
    }

    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        userExists,
        taskCount,
        pomodoroCount,
        timestamp: new Date().toISOString(),
        environment: {
          postgresUrl: process.env.POSTGRES_PRISMA_URL ? 'configured' : 'not configured',
          databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
        }
      }
    })
  } catch (error) {
    console.error('[Health] Error:', error)
    return NextResponse.json({
      success: false,
      error: '健康检查失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
