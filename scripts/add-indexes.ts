import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 添加数据库索引以提升查询性能
 * 运行方式: npx tsx scripts/add-indexes.ts
 */
async function addIndexes() {
  console.log('🚀 开始添加数据库索引...\n')

  try {
    // 检查现有索引
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('User', 'Task', 'Pomodoro', 'DailyStat', 'StudyRecord')
    `)

    const tableNames = (tables as any[]).map(t => t.table_name)
    console.log(`✓ 找到 ${tableNames.length} 个表: ${tableNames.join(', ')}\n`)

    // 为 Task 表添加索引
    console.log('📝 为 Task 表添加索引...')
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Task_userId_isCompleted_idx"
      ON "Task" ("userId", "isCompleted")
    `)
    console.log('  ✓ "userId, isCompleted" 索引')

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Task_userId_isActive_idx"
      ON "Task" ("userId", "isActive")
    `)
    console.log('  ✓ "userId, isActive" 索引')

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Task_userId_createdAt_idx"
      ON "Task" ("userId", "createdAt")
    `)
    console.log('  ✓ "userId, createdAt" 索引')

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Task_userId_subject_idx"
      ON "Task" ("userId", "subject")
    `)
    console.log('  ✓ "userId, subject" 索引')

    // 为 Pomodoro 表添加索引
    console.log('\n📝 为 Pomodoro 表添加索引...')
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Pomodoro_userId_status_idx"
      ON "Pomodoro" ("userId", "status")
    `)
    console.log('  ✓ "userId, status" 索引')

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Pomodoro_userId_startedAt_idx"
      ON "Pomodoro" ("userId", "startedAt")
    `)
    console.log('  ✓ "userId, startedAt" 索引')

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Pomodoro_taskId_status_idx"
      ON "Pomodoro" ("taskId", "status")
    `)
    console.log('  ✓ "taskId, status" 索引')

    // 为 DailyStat 表添加索引
    console.log('\n📝 为 DailyStat 表添加索引...')
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "DailyStat_userId_idx"
      ON "DailyStat" ("userId")
    `)
    console.log('  ✓ "userId" 索引')

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "DailyStat_date_idx"
      ON "DailyStat" ("date")
    `)
    console.log('  ✓ "date" 索引')

    // 为 StudyRecord 表添加索引
    console.log('\n📝 为 StudyRecord 表添加索引...')
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "StudyRecord_userId_createdAt_idx"
      ON "StudyRecord" ("userId", "createdAt")
    `)
    console.log('  ✓ "userId, createdAt" 索引')

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "StudyRecord_subject_idx"
      ON "StudyRecord" ("subject")
    `)
    console.log('  ✓ "subject" 索引')

    // 验证索引
    console.log('\n🔍 验证索引...')
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('Task', 'Pomodoro', 'DailyStat', 'StudyRecord')
    `)

    console.log(`\n✓ 共找到 ${indexes.length} 个索引:`)
    indexes.forEach((idx: any) => {
      console.log(`  • ${idx.tablename}.${idx.indexname}`)
    })

    console.log('\n✅ 数据库索引添加完成！')
    console.log('\n💡 提示:')
    console.log('  - 新索引会在下次构建时生效')
    console.log('  - 已有数据会自动使用新索引')
    console.log('  - 如需重新生成 Prisma Client: npx prisma generate')

  } catch (error) {
    console.error('\n❌ 添加索引失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addIndexes()
