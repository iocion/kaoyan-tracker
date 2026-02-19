import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

// 获取学习记录
export async function GET() {
  try {
    const userId = 'default'
    
    const records = await prisma.studyRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    
    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 添加学习记录
export async function POST(request: NextRequest) {
  try {
    const userId = 'default'
    const body = await request.json()
    
    const { subject, duration, notes } = body
    
    // 创建记录
    const record = await prisma.studyRecord.create({
      data: {
        userId,
        subject,
        duration: parseFloat(duration),
        notes,
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
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        totalHours: { increment: parseFloat(duration) },
        [subjectField]: { increment: parseFloat(duration) },
      },
      create: {
        userId,
        date: today,
        totalHours: parseFloat(duration),
        [subjectField]: parseFloat(duration),
      },
    })
    
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Create record error:', error)
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
