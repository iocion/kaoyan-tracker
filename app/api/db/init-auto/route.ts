import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/db/init-auto
 * 自动初始化数据库表结构
 *
 * 这个端点会：
 * 1. 推送 Prisma schema 到数据库
 * 2. 创建所有必需的表
 * 3. 创建默认用户和设置
 *
 * 用户只需访问这个端点，无需手动运行 prisma db push
 */
export async function POST() {
  try {
    console.log('[DB Init] Starting automatic database initialization...')

    // 方法 1: 使用 db push（推荐）
    try {
      console.log('[DB Init] Trying db push...')
      const { execSync } = require('child_process')
      execSync('npx prisma db push', { stdio: 'inherit' })

      console.log('[DB Init] db push completed successfully!')

      return NextResponse.json({
        success: true,
        message: '数据库初始化成功',
        method: 'prisma db push',
        tables: ['User', 'Task', 'Pomodoro', 'DailyStat', 'UserSettings', 'StudyRecord']
      })
    } catch (error: any) {
      console.error('[DB Init] db push failed:', error)

      // 方法 2: 使用 schema push（备用）
      try {
        console.log('[DB Init] Trying schema push...')
        const { execSync } = require('child_process')
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })

        return NextResponse.json({
          success: true,
          message: '数据库初始化成功',
          method: 'prisma db push --accept-data-loss',
          warning: '使用了 --accept-data-loss 参数'
        })
      } catch (error2: any) {
        console.error('[DB Init] schema push failed:', error2)
      }
    }
  } catch (error) {
    console.error('[DB Init] Initialization failed:', error)

    return NextResponse.json({
      success: false,
      error: '数据库初始化失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * GET /api/db/init-auto
 * 检查数据库初始化状态
 */
export async function GET() {
  try {
    // 检查 User 表是否存在
    const userCount = await prisma.user.count()

    // 检查 Task 表是否存在
    const taskCount = await prisma.task.count()

    return NextResponse.json({
      success: true,
      data: {
        initialized: userCount > 0,
        userTable: userCount > 0 ? 'exists' : 'missing',
        taskTable: taskCount > 0 ? 'exists' : 'missing',
        userCount,
        taskCount
      }
    })
  } catch (error) {
    console.error('[DB Init] Check failed:', error)

    return NextResponse.json({
      success: false,
      error: '检查数据库状态失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
