import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Subject } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/db/init
 * 自动初始化数据库表和用户数据
 *
 * 这个端点会：
 * 1. 检查表是否存在
 * 2. 如果不存在，自动创建所有表
 * 3. 创建默认用户和设置
 * 4. 创建示例任务
 */
export async function POST() {
  try {
    const userId = 'default'

    console.log('[DB Init] Starting database initialization...')

    // 检查 User 表是否存在（通过尝试查询）
    try {
      await prisma.user.findUnique({
        where: { id: userId }
      })
      console.log('[DB Init] Database tables already exist')
    } catch (error: any) {
      // 如果表不存在，尝试创建
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('[DB Init] Tables do not exist, creating...')

        // 创建表结构
        try {
          // 使用 Prisma 的原始 SQL 创建表
          await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "User" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL DEFAULT '考研人',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,

                PRIMARY KEY ("id")
            );
          `)

          await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "UserSettings" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,

                "focusDuration" INTEGER NOT NULL DEFAULT 25,
                "breakDuration" INTEGER NOT NULL DEFAULT 5,
                "longBreakDuration" INTEGER NOT NULL DEFAULT 15,
                "pomodorosUntilLongBreak" INTEGER NOT NULL DEFAULT 4,
                "autoStartBreak" BOOLEAN NOT NULL DEFAULT false,
                "autoStartFocus" BOOLEAN NOT NULL DEFAULT false,
                "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
                "vibrationEnabled" BOOLEAN NOT NULL DEFAULT true,

                CONSTRAINT "UserSettings_userId_key" UNIQUE ("userId")
            );
          `)

          await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Task" (
                "id" TEXT NOT NULL,
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

          await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Pomodoro" (
                "id" TEXT NOT NULL,
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

          await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "DailyStat" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "date" TIMESTAMP(3) NOT NULL,

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

                CONSTRAINT "DailyStat_userId_date_key" UNIQUE ("userId", "date")
            );
          `)

          await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "StudyRecord" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "subject" TEXT NOT NULL,
                "duration" DOUBLE PRECISION NOT NULL,
                "notes" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

                PRIMARY KEY ("id")
            );
          `)

          console.log('[DB Init] Tables created successfully')
        } catch (createError: any) {
          console.error('[DB Init] Failed to create tables:', createError)
          throw new Error(`创建表失败: ${createError.message}`)
        }
      } else {
        throw error
      }
    }

    // 创建或更新用户
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: '考研人'
      }
    })
    console.log('[DB Init] User created/updated')

    // 创建默认设置
    await prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        focusDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        pomodorosUntilLongBreak: 4,
        autoStartBreak: false,
        autoStartFocus: false,
        soundEnabled: true,
        vibrationEnabled: true
      }
    })
    console.log('[DB Init] UserSettings created/updated')

    // 创建示例任务
    const sampleTasks = [
      { title: '数据结构 - 复习二叉树', subject: Subject.COMPUTER_408, estimatedPomodoros: 2 },
      { title: '高数 - 微积分练习', subject: Subject.MATH, estimatedPomodoros: 3 },
      { title: '英语单词背诵', subject: Subject.ENGLISH, estimatedPomodoros: 1 },
      { title: '马原复习', subject: Subject.POLITICS, estimatedPomodoros: 2 }
    ]

    let tasksCreated = 0
    for (const task of sampleTasks) {
      try {
        await prisma.task.create({
          data: {
            userId,
            ...task
          }
        })
        tasksCreated++
      } catch (error: any) {
        // 如果任务已存在，跳过
        if (error.code === 'P2002') {
          console.log(`[DB Init] Task already exists: ${task.title}`)
        } else {
          console.error(`[DB Init] Failed to create task: ${task.title}`, error)
        }
      }
    }
    console.log(`[DB Init] Created ${tasksCreated} sample tasks`)

    return NextResponse.json({
      success: true,
      message: '数据库初始化成功',
      data: {
        userId,
        tasksCreated,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[DB Init] Error:', error)
    return NextResponse.json({
      success: false,
      error: '数据库初始化失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * GET /api/db/init
 * 检查数据库是否已初始化
 */
export async function GET() {
  try {
    const userId = 'default'

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // 检查任务数量
    const taskCount = await prisma.task.count({
      where: { userId }
    })

    return NextResponse.json({
      success: true,
      data: {
        initialized: !!user,
        userId,
        taskCount
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: {
        initialized: false,
        error: '数据库未初始化'
      }
    })
  }
}
