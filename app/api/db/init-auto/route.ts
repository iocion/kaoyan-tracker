import { NextResponse } from 'next/server'
import { Subject } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/db/init-auto
 * 自动初始化数据库表结构（使用原始 SQL）
 */
export async function POST() {
  const results: string[] = []
  
  try {
    // 检查环境变量
    if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: '数据库连接未配置',
        details: '请在 Vercel 项目设置中添加 POSTGRES_PRISMA_URL'
      }, { status: 500 })
    }

    const { prisma } = await import('@/lib/prisma')
    const userId = 'default'

    results.push('开始数据库初始化...')

    // ========== 步骤 1: 创建所有表 ==========
    try {
      results.push('创建 User 表...')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL DEFAULT '考研人',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY ("id")
        );
      `)
      results.push('✓ User 表创建成功')

      results.push('创建 UserSettings 表...')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "UserSettings" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "userId" TEXT NOT NULL,
          "focusDuration" INTEGER NOT NULL DEFAULT 25,
          "breakDuration" INTEGER NOT NULL DEFAULT 5,
          "longBreakDuration" INTEGER NOT NULL DEFAULT 15,
          "pomodorosUntilLongBreak" INTEGER NOT NULL DEFAULT 4,
          "autoStartBreak" BOOLEAN NOT NULL DEFAULT false,
          "autoStartFocus" BOOLEAN NOT NULL DEFAULT false,
          "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
          "vibrationEnabled" BOOLEAN NOT NULL DEFAULT true,
          PRIMARY KEY ("id"),
          UNIQUE ("userId")
        );
      `)
      results.push('✓ UserSettings 表创建成功')

      results.push('创建 Task 表...')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Task" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "userId" TEXT NOT NULL,
          "title" VARCHAR(200) NOT NULL,
          "subject" TEXT NOT NULL,
          "estimatedPomodoros" INTEGER NOT NULL DEFAULT 1,
          "completedPomodoros" INTEGER NOT NULL DEFAULT 0,
          "isCompleted" BOOLEAN NOT NULL DEFAULT false,
          "isActive" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "completedAt" TIMESTAMP(3),
          PRIMARY KEY ("id")
        );
      `)
      results.push('✓ Task 表创建成功')

      results.push('创建 Pomodoro 表...')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Pomodoro" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "userId" TEXT NOT NULL,
          "taskId" TEXT,
          "type" TEXT NOT NULL,
          "status" TEXT NOT NULL,
          "duration" INTEGER NOT NULL,
          "elapsedTime" INTEGER NOT NULL DEFAULT 0,
          "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "endedAt" TIMESTAMP(3),
          "pauseCount" INTEGER NOT NULL DEFAULT 0,
          "totalPausedTime" INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY ("id")
        );
      `)
      results.push('✓ Pomodoro 表创建成功')

      results.push('创建 DailyStat 表...')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "DailyStat" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "userId" TEXT NOT NULL,
          "date" DATE NOT NULL,
          "totalPomodoros" INTEGER NOT NULL DEFAULT 0,
          "totalFocusTime" INTEGER NOT NULL DEFAULT 0,
          "totalBreakTime" INTEGER NOT NULL DEFAULT 0,
          "pomodoros408" INTEGER NOT NULL DEFAULT 0,
          "pomodorosMath" INTEGER NOT NULL DEFAULT 0,
          "pomodorosEnglish" INTEGER NOT NULL DEFAULT 0,
          "pomodorosPolitics" INTEGER NOT NULL DEFAULT 0,
          "completedTasks" INTEGER NOT NULL DEFAULT 0,
          "createdTasks" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY ("id"),
          UNIQUE ("userId", "date")
        );
      `)
      results.push('✓ DailyStat 表创建成功')

      results.push('创建 StudyRecord 表...')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "StudyRecord" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "userId" TEXT NOT NULL,
          "subject" TEXT NOT NULL,
          "duration" DOUBLE PRECISION NOT NULL,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY ("id")
        );
      `)
      results.push('✓ StudyRecord 表创建成功')

    } catch (error: any) {
      results.push(`✗ 创建表失败: ${error.message}`)
      return NextResponse.json({
        success: false,
        error: '创建表失败',
        details: error.message,
        logs: results
      }, { status: 500 })
    }

    // ========== 步骤 2: 验证表是否存在 ==========
    try {
      results.push('验证表是否存在...')
      const tableCheck = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('User', 'UserSettings', 'Task', 'Pomodoro', 'DailyStat', 'StudyRecord')
      `
      const existingTables = (tableCheck as any[]).map(t => t.table_name)
      results.push(`已存在的表: ${existingTables.join(', ')}`)
      
      if (existingTables.length < 6) {
        const missing = ['User', 'UserSettings', 'Task', 'Pomodoro', 'DailyStat', 'StudyRecord']
          .filter(t => !existingTables.includes(t))
        results.push(`✗ 缺少表: ${missing.join(', ')}`)
        return NextResponse.json({
          success: false,
          error: '部分表未创建成功',
          details: `缺少表: ${missing.join(', ')}`,
          logs: results
        }, { status: 500 })
      }
    } catch (error: any) {
      results.push(`✗ 验证表失败: ${error.message}`)
    }

    // ========== 步骤 3: 使用原始 SQL 插入数据 ==========
    try {
      results.push('插入默认用户...')
      
      // 检查用户是否已存在
      const existingUser = await prisma.$queryRaw`
        SELECT "id" FROM "User" WHERE "id" = ${userId}
      `
      
      if ((existingUser as any[]).length === 0) {
        await prisma.$executeRaw`
          INSERT INTO "User" ("id", "name", "createdAt", "updatedAt")
          VALUES (${userId}, '考研人', NOW(), NOW())
        `
        results.push('✓ 用户创建成功')
      } else {
        results.push('✓ 用户已存在')
      }

    } catch (error: any) {
      results.push(`✗ 创建用户失败: ${error.message}`)
      return NextResponse.json({
        success: false,
        error: '创建用户失败',
        details: error.message,
        logs: results
      }, { status: 500 })
    }

    try {
      results.push('插入默认设置...')
      
      // 检查设置是否已存在
      const existingSettings = await prisma.$queryRaw`
        SELECT "id" FROM "UserSettings" WHERE "userId" = ${userId}
      `
      
      if ((existingSettings as any[]).length === 0) {
        await prisma.$executeRaw`
          INSERT INTO "UserSettings" ("userId", "focusDuration", "breakDuration", "longBreakDuration", 
            "pomodorosUntilLongBreak", "autoStartBreak", "autoStartFocus", "soundEnabled", "vibrationEnabled")
          VALUES (${userId}, 25, 5, 15, 4, false, false, true, true)
        `
        results.push('✓ 用户设置创建成功')
      } else {
        results.push('✓ 用户设置已存在')
      }

    } catch (error: any) {
      results.push(`✗ 创建设置失败: ${error.message}`)
      return NextResponse.json({
        success: false,
        error: '创建设置失败',
        details: error.message,
        logs: results
      }, { status: 500 })
    }

    try {
      results.push('插入示例任务...')
      
      // 检查是否已有任务
      const existingTasks = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Task" WHERE "userId" = ${userId}
      `
      
      if ((existingTasks as any[])[0].count === 0) {
        const sampleTasks = [
          { title: '数据结构 - 复习二叉树', subject: 'COMPUTER_408', pomodoros: 2 },
          { title: '高数 - 微积分练习', subject: 'MATH', pomodoros: 3 },
          { title: '英语单词背诵', subject: 'ENGLISH', pomodoros: 1 },
          { title: '马原复习', subject: 'POLITICS', pomodoros: 2 }
        ]

        for (const task of sampleTasks) {
          await prisma.$executeRaw`
            INSERT INTO "Task" ("userId", "title", "subject", "estimatedPomodoros", "isCompleted", "isActive", "createdAt")
            VALUES (${userId}, ${task.title}, ${task.subject}, ${task.pomodoros}, false, false, NOW())
          `
        }
        results.push(`✓ 创建了 ${sampleTasks.length} 个示例任务`)
      } else {
        results.push('✓ 示例任务已存在')
      }

    } catch (error: any) {
      results.push(`✗ 创建任务失败: ${error.message}`)
      // 不返回错误，任务创建失败不影响整体初始化
    }

    results.push('数据库初始化完成！')
    
    return NextResponse.json({
      success: true,
      message: '数据库初始化成功',
      logs: results,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    results.push(`✗ 初始化失败: ${error.message}`)
    return NextResponse.json({
      success: false,
      error: '数据库初始化失败',
      details: error.message,
      logs: results
    }, { status: 500 })
  }
}

/**
 * GET /api/db/init-auto
 * 检查数据库初始化状态
 */
export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma')

    // 检查表是否存在
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'UserSettings', 'Task', 'Pomodoro', 'DailyStat', 'StudyRecord')
    `

    const tableNames = (tables as any[]).map(t => t.table_name)
    
    // 检查数据
    let userCount = 0
    let taskCount = 0
    
    if (tableNames.includes('User')) {
      const userResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`
      userCount = (userResult as any[])[0]?.count || 0
    }
    
    if (tableNames.includes('Task')) {
      const taskResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Task"`
      taskCount = (taskResult as any[])[0]?.count || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        initialized: tableNames.length >= 6 && userCount > 0,
        tables: {
          total: 6,
          created: tableNames.length,
          list: tableNames
        },
        data: {
          users: userCount,
          tasks: taskCount
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: '检查数据库状态失败',
      details: error.message
    }, { status: 500 })
  }
}
