import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const userId = 'default'
    const body = await request.json()
    const { action, subject, title, duration } = body
    
    if (action === 'start') {
      // 创建新的计时会话
      const session = await prisma.timerSession.create({
        data: {
          userId,
          subject,
          title: title || '',
          startTime: new Date(),
          isRunning: true,
        },
      })
      return NextResponse.json(session)
    }
    
    if (action === 'stop') {
      // 停止计时并创建学习记录
      const durationHours = duration / 3600
      
      const record = await prisma.studyRecord.create({
        data: {
          userId,
          subject,
          duration: durationHours,
          notes: title || '计时器学习',
        },
      })
      
      // 更新每日统计
      const today = startOfDay(new Date())
      const subjectFieldMap: Record<string, string> = {
        'COMPUTER_408': 'hours408',
        'MATH': 'hoursMath',
        'ENGLISH': 'hoursEnglish',
        'POLITICS': 'hoursPolitics',
      }
      const subjectField = subjectFieldMap[subject] || 'hours408'
      
      await prisma.dailyStatistic.upsert({
        where: {
          userId_date: { userId, date: today },
        },
        update: {
          totalHours: { increment: durationHours },
          [subjectField]: { increment: durationHours },
        },
        create: {
          userId,
          date: today,
          totalHours: durationHours,
          [subjectField]: durationHours,
        },
      })
      
      return NextResponse.json(record)
    }
    
    return NextResponse.json({ error: '无效操作' }, { status: 400 })
  } catch (error) {
    console.error('Timer error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const userId = 'default'
    const today = startOfDay(new Date())
    
    const sessions = await prisma.timerSession.findMany({
      where: {
        userId,
        startTime: { gte: today },
      },
      orderBy: { startTime: 'desc' },
    })
    
    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
