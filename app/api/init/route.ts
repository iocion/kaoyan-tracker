import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const userId = 'default'
    
    // 创建或更新用户
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: '考研人'
      }
    })
    
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
    
    // 创建示例任务
    const sampleTasks = [
      { title: '数据结构 - 复习二叉树', subject: 'COMPUTER_408', estimatedPomodoros: 2 },
      { title: '高数 - 微积分练习', subject: 'MATH', estimatedPomodoros: 3 },
      { title: '英语单词背诵', subject: 'ENGLISH', estimatedPomodoros: 1 },
      { title: '马原复习', subject: 'POLITICS', estimatedPomodoros: 2 }
    ]
    
    for (const task of sampleTasks) {
      await prisma.task.create({
        data: {
          userId,
          ...task
        }
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '初始化成功',
      tasksCreated: sampleTasks.length
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 })
  }
}
