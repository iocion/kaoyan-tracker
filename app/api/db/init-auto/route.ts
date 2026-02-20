import { NextResponse } from 'next/server'
import { Subject } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/db/init-auto
 * 自动初始化数据库表结构（使用原始 SQL）
 *
 * 访问此端点会自动：
 * 1. 创建所有必需的表
 * 2. 创建默认用户和设置
 * 3. 创建示例任务
 *
 * 不需要手动运行 prisma db push
 */
export async function POST() {
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

    console.log('[DB Init] Starting database initialization...')
    console.log('[DB Init] Database URL:', process.env.POSTGRES_PRISMA_URL?.substring(0, 30) + '...')

    // 步骤 1: 创建表结构
    try {
      console.log('[DB Init] Creating tables...')

      // User 表
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL DEFAULT '考研人',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          PRIMARY KEY ("id")
        );
      `)
      console.log('[DB Init] User table created')

      // UserSettings 表
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
      console.log('[DB Init] UserSettings table created')

      // 验证 UserSettings 表是否存在
      try {
        const result = await prisma.$queryRaw`
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'UserSettings'
        `
        console.log('[DB Init] UserSettings table verified:', Array.isArray(result) && result.length > 0)
      } catch (verifyError) {
        console.error('[DB Init] UserSettings verification failed:', verifyError)
      }

      // Task 表
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
      console.log('[DB Init] Task table created')

      // 创建索引
      try {
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "Task_userId_isCompleted_idx" ON "Task"("userId", "isCompleted");
        `)
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "Task_userId_isActive_idx" ON "Task"("userId", "isActive");
        `)
      } catch (e) {
        // 索引可能已存在，忽略
      }

      // Pomodoro 表
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
      console.log('[DB Init] Pomodoro table created')

      // 创建索引
      try {
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "Pomodoro_userId_status_idx" ON "Pomodoro"("userId", "status");
        `)
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "Pomodoro_userId_startedAt_idx" ON "Pomodoro"("userId", "startedAt");
        `)
      } catch (e) {
        // 索引可能已存在，忽略
      }

      // DailyStat 表
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
      console.log('[DB Init] DailyStat table created')

      // StudyRecord 表
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
      console.log('[DB Init] StudyRecord table created')

      // 创建索引
      try {
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "StudyRecord_userId_createdAt_idx" ON "StudyRecord"("userId", "createdAt");
        `)
      } catch (e) {
        // 索引可能已存在，忽略
      }

      console.log('[DB Init] All tables created successfully')
    } catch (createError: any) {
      console.error('[DB Init] Failed to create tables:', createError)
      return NextResponse.json({
        success: false,
        error: '创建表失败',
        details: createError.message
      }, { status: 500 })
    }

    // 步骤 2: 刷新 Prisma schema 缓存
    try {
      console.log('[DB Init] Refreshing Prisma client...')
      await prisma.$disconnect()
      await prisma.$connect()
    } catch (error) {
      console.warn('[DB Init] Failed to refresh Prisma client:', error)
      // 继续执行，不影响
    }

    // 步骤 3: 创建或更新用户
    try {
      console.log('[DB Init] Creating/updating user...')
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: '考研人'
        }
      })
      console.log('[DB Init] User created/updated')
    } catch (userError: any) {
      console.error('[DB Init] Failed to create user:', userError)
      return NextResponse.json({
        success: false,
        error: '创建用户失败',
        details: userError.message
      }, { status: 500 })
    }

    // 步骤 4: 创建默认设置
    try {
      console.log('[DB Init] Creating/updating user settings...')
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
    } catch (settingsError: any) {
      console.error('[DB Init] Failed to create user settings:', settingsError)
      return NextResponse.json({
        success: false,
        error: '创建用户设置失败',
        details: settingsError.message
      }, { status: 500 })
    }

    // 步骤 5: 创建示例任务
    try {
      console.log('[DB Init] Creating sample tasks...')
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
    } catch (tasksError: any) {
      console.error('[DB Init] Failed to create sample tasks:', tasksError)
      return NextResponse.json({
        success: false,
        error: '创建示例任务失败',
        details: tasksError.message
      }, { status: 500 })
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
    const { prisma } = await import('@/lib/prisma')

    // 检查 User 表是否存在
    let userExists = false
    try {
      const userCount = await prisma.user.count()
      userExists = userCount > 0
    } catch (error) {
      userExists = false
    }

    // 检查 Task 表是否存在
    let taskCount = 0
    try {
      taskCount = await prisma.task.count()
    } catch (error) {
      taskCount = 0
    }

    return NextResponse.json({
      success: true,
      data: {
        initialized: userExists,
        userTable: userExists ? 'exists' : 'missing',
        taskTable: taskCount > 0 ? 'exists' : 'missing',
        userCount: userExists ? 1 : 0,
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
