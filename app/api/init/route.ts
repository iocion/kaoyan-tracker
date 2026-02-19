import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const subjects = [
      { id: 'COMPUTER_408', name: '计算机408', color: '#3B82F6' },
      { id: 'MATH', name: '数学', color: '#10B981' },
      { id: 'ENGLISH', name: '英语', color: '#F59E0B' },
      { id: 'POLITICS', name: '政治', color: '#EF4444' },
    ]
    return NextResponse.json(subjects)
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function POST() {
  try {
    // 初始化默认用户
    await prisma.user.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default', name: '考研人' },
    })
    return NextResponse.json({ success: true, message: '初始化成功' })
  } catch (error) {
    return NextResponse.json({ error: '初始化失败' }, { status: 500 })
  }
}
