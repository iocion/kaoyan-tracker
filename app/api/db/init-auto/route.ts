import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/db/init-auto
 * 自动初始化数据库表结构（完全使用原始 SQL，兼容 Neon）
 */
export async function POST() {
  const logs: string[] = []
  
  try {
    // 检查环境变量
    if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: '数据库连接未配置',
        details: '请在 Vercel 项目设置中添加 POSTGRES_PRISMA_URL 或 DATABASE_URL'
      }, { status: 500 })
    }

    // 动态导入 prisma，避免构建时初始化
    const { prisma } = await import('@/lib/prisma')
    const userId = 'default'

    logs.push('开始数据库初始化...')
    logs.push(`数据库 URL: ${process.env.POSTGRES_PRISMA_URL?.substring(0, 40)}...`)

    // ========== 步骤 1: 测试数据库连接 ==========
    try {
      logs.push('测试数据库连接...')
      await prisma.$queryRawUnsafe(`SELECT 1`)
      logs.push('✓ 数据库连接成功')
    } catch (error: any) {
      logs.push(`✗ 数据库连接失败: ${error.message}`)
      return NextResponse.json({
        success: false,
        error: '数据库连接失败',
        details: error.message,
        logs
      }, { status: 500 })
    }

    // ========== 步骤 2: 创建所有表 ==========
    const createTable = async (name: string, sql: string) => {
      try {
        logs.push(`创建 ${name} 表...`)
        await prisma.$executeRawUnsafe(sql)
        logs.push(`✓ ${name} 表创建成功`)
        return true
      } catch (error: any) {
        // 表已存在不算错误
        if (error.message?.includes('already exists') || error.code === '42P07') {
          logs.push(`✓ ${name} 表已存在`)
          return true
        }
        logs.push(`✗ ${name} 表创建失败: ${error.message}`)
        throw error
      }
    }

    try {
      // User 表
      await createTable('User', `
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL DEFAULT '考研人',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // UserSettings 表
      await createTable('UserSettings', `
        CREATE TABLE IF NOT EXISTS "UserSettings" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          "userId" TEXT NOT NULL UNIQUE,
          "focusDuration" INTEGER NOT NULL DEFAULT 25,
          "breakDuration" INTEGER NOT NULL DEFAULT 5,
          "longBreakDuration" INTEGER NOT NULL DEFAULT 15,
          "pomodorosUntilLongBreak" INTEGER NOT NULL DEFAULT 4,
          "autoStartBreak" BOOLEAN NOT NULL DEFAULT false,
          "autoStartFocus" BOOLEAN NOT NULL DEFAULT false,
          "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
          "vibrationEnabled" BOOLEAN NOT NULL DEFAULT true
        )
      `)

      // Task 表
      await createTable('Task', `
        CREATE TABLE IF NOT EXISTS "Task" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "title" VARCHAR(200) NOT NULL,
          "subject" TEXT NOT NULL,
          "estimatedPomodoros" INTEGER NOT NULL DEFAULT 1,
          "completedPomodoros" INTEGER NOT NULL DEFAULT 0,
          "isCompleted" BOOLEAN NOT NULL DEFAULT false,
          "isActive" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "completedAt" TIMESTAMP(3)
        )
      `)

      // Pomodoro 表
      await createTable('Pomodoro', `
        CREATE TABLE IF NOT EXISTS "Pomodoro" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "taskId" TEXT,
          "type" TEXT NOT NULL,
          "status" TEXT NOT NULL,
          "duration" INTEGER NOT NULL,
          "elapsedTime" INTEGER NOT NULL DEFAULT 0,
          "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "endedAt" TIMESTAMP(3),
          "pauseCount" INTEGER NOT NULL DEFAULT 0,
          "totalPausedTime" INTEGER NOT NULL DEFAULT 0
        )
      `)

      // DailyStat 表
      await createTable('DailyStat', `
        CREATE TABLE IF NOT EXISTS "DailyStat" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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
          UNIQUE ("userId", "date")
        )
      `)

      // StudyRecord 表
      await createTable('StudyRecord', `
        CREATE TABLE IF NOT EXISTS "StudyRecord" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "subject" TEXT NOT NULL,
          "duration" DOUBLE PRECISION NOT NULL,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)

      logs.push('✓ 所有表创建完成')

    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: '创建表失败',
        details: error.message,
        logs
      }, { status: 500 })
    }

    // ========== 步骤 3: 验证表是否存在 ==========
    try {
      logs.push('验证表是否存在...')
      const tableCheck = await prisma.$queryRawUnsafe(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('User', 'UserSettings', 'Task', 'Pomodoro', 'DailyStat', 'StudyRecord')
      `)
      
      const existingTables = (tableCheck as any[]).map(t => t.table_name)
      logs.push(`已验证的表: ${existingTables.join(', ')} (${existingTables.length}/6)`)
      
      if (existingTables.length < 6) {
        const missing = ['User', 'UserSettings', 'Task', 'Pomodoro', 'DailyStat', 'StudyRecord']
          .filter(t => !existingTables.includes(t))
        logs.push(`✗ 缺少表: ${missing.join(', ')}`)
      }
    } catch (error: any) {
      logs.push(`⚠ 验证表时出错: ${error.message}`)
    }

    // ========== 步骤 4: 插入默认数据（使用纯 SQL） ==========
    
    // 插入用户
    try {
      logs.push('插入默认用户...')
      
      const userCheck = await prisma.$queryRawUnsafe(`
        SELECT "id" FROM "User" WHERE "id" = '${userId}'
      `)
      
      if ((userCheck as any[]).length === 0) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "User" ("id", "name", "createdAt", "updatedAt")
          VALUES ('${userId}', '考研人', NOW(), NOW())
        `)
        logs.push('✓ 用户创建成功')
      } else {
        logs.push('✓ 用户已存在')
      }
    } catch (error: any) {
      logs.push(`✗ 创建用户失败: ${error.message}`)
      return NextResponse.json({
        success: false,
        error: '创建用户失败',
        details: error.message,
        logs
      }, { status: 500 })
    }

    // 插入设置
    try {
      logs.push('插入默认设置...')
      
      const settingsCheck = await prisma.$queryRawUnsafe(`
        SELECT "id" FROM "UserSettings" WHERE "userId" = '${userId}'
      `)
      
      if ((settingsCheck as any[]).length === 0) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "UserSettings" 
          ("userId", "focusDuration", "breakDuration", "longBreakDuration", 
           "pomodorosUntilLongBreak", "autoStartBreak", "autoStartFocus", 
           "soundEnabled", "vibrationEnabled")
          VALUES 
          ('${userId}', 25, 5, 15, 4, false, false, true, true)
        `)
        logs.push('✓ 用户设置创建成功')
      } else {
        logs.push('✓ 用户设置已存在')
      }
    } catch (error: any) {
      logs.push(`✗ 创建设置失败: ${error.message}`)
      return NextResponse.json({
        success: false,
        error: '创建设置失败',
        details: error.message,
        logs
      }, { status: 500 })
    }

    // 插入示例任务
    try {
      logs.push('插入示例任务...')
      
      const taskCheck = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM "Task" WHERE "userId" = '${userId}'
      `)
      
      const taskCount = parseInt((taskCheck as any[])[0]?.count || '0')
      
      if (taskCount === 0) {
        const sampleTasks = [
          { title: '数据结构 - 复习二叉树', subject: 'COMPUTER_408', pomodoros: 2 },
          { title: '高数 - 微积分练习', subject: 'MATH', pomodoros: 3 },
          { title: '英语单词背诵', subject: 'ENGLISH', pomodoros: 1 },
          { title: '马原复习', subject: 'POLITICS', pomodoros: 2 }
        ]

        for (const task of sampleTasks) {
          // 转义单引号
          const safeTitle = task.title.replace(/'/g, "''")
          await prisma.$executeRawUnsafe(`
            INSERT INTO "Task" 
            ("userId", "title", "subject", "estimatedPomodoros", "isCompleted", "isActive", "createdAt")
            VALUES 
            ('${userId}', '${safeTitle}', '${task.subject}', ${task.pomodoros}, false, false, NOW())
          `)
        }
        logs.push(`✓ 创建了 ${sampleTasks.length} 个示例任务`)
      } else {
        logs.push(`✓ 已有 ${taskCount} 个任务，跳过创建`)
      }
    } catch (error: any) {
      logs.push(`⚠ 创建任务失败: ${error.message}`)
      // 任务创建失败不影响整体成功
    }

    logs.push('数据库初始化完成！')
    
    return NextResponse.json({
      success: true,
      message: '数据库初始化成功',
      logs,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    logs.push(`✗ 初始化失败: ${error.message}`)
    return NextResponse.json({
      success: false,
      error: '数据库初始化失败',
      details: error.message,
      logs
    }, { status: 500 })
  }
}

/**
 * GET /api/db/init-auto
 * 检查数据库初始化状态
 */
export async function GET() {
  const logs: string[] = []
  
  try {
    const { prisma } = await import('@/lib/prisma')

    // 检查表是否存在
    logs.push('检查表状态...')
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'UserSettings', 'Task', 'Pomodoro', 'DailyStat', 'StudyRecord')
    `)

    const tableNames = (tables as any[]).map(t => t.table_name)
    logs.push(`找到 ${tableNames.length} 个表: ${tableNames.join(', ') || '无'}`)
    
    // 检查数据
    let userCount = 0
    let taskCount = 0
    
    if (tableNames.includes('User')) {
      try {
        const userResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "User"`)
        userCount = parseInt((userResult as any[])[0]?.count || '0')
        logs.push(`用户数量: ${userCount}`)
      } catch (e: any) {
        logs.push(`查询用户失败: ${e.message}`)
      }
    }
    
    if (tableNames.includes('Task')) {
      try {
        const taskResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "Task"`)
        taskCount = parseInt((taskResult as any[])[0]?.count || '0')
        logs.push(`任务数量: ${taskCount}`)
      } catch (e: any) {
        logs.push(`查询任务失败: ${e.message}`)
      }
    }

    const initialized = tableNames.length >= 6 && userCount > 0

    return NextResponse.json({
      success: true,
      data: {
        initialized,
        tables: {
          total: 6,
          created: tableNames.length,
          list: tableNames
        },
        data: {
          users: userCount,
          tasks: taskCount
        }
      },
      logs
    })
  } catch (error: any) {
    logs.push(`检查失败: ${error.message}`)
    return NextResponse.json({
      success: false,
      error: '检查数据库状态失败',
      details: error.message,
      logs
    }, { status: 500 })
  }
}
