import { prisma } from '@/lib/prisma'
import { StudyRecord, StudyRecordCreateInput, Subject } from '@/types'
import { startOfDay, endOfDay } from 'date-fns'

/**
 * 学习记录服务
 * 封装所有学习记录相关的业务逻辑
 */
export class RecordService {
  private static readonly DEFAULT_USER_ID = 'default'

  /**
   * 获取所有学习记录
   */
  static async getAll(limit: number = 50): Promise<StudyRecord[]> {
    try {
      const records = await prisma.studyRecord.findMany({
        where: { userId: this.DEFAULT_USER_ID },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return records as StudyRecord[]
    } catch (error) {
      console.error('[RecordService] Get all error:', error)
      throw new Error('获取记录失败')
    }
  }

  /**
   * 按学科筛选记录
   */
  static async getBySubject(subject: Subject, limit: number = 50): Promise<StudyRecord[]> {
    try {
      const records = await prisma.studyRecord.findMany({
        where: {
          userId: this.DEFAULT_USER_ID,
          subject
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return records as StudyRecord[]
    } catch (error) {
      console.error('[RecordService] Get by subject error:', error)
      throw new Error('获取记录失败')
    }
  }

  /**
   * 按日期范围获取记录
   */
  static async getByDateRange(startDate: Date, endDate: Date): Promise<StudyRecord[]> {
    try {
      const records = await prisma.studyRecord.findMany({
        where: {
          userId: this.DEFAULT_USER_ID,
          createdAt: { gte: startDate, lte: endDate }
        },
        orderBy: { createdAt: 'desc' }
      })

      return records as StudyRecord[]
    } catch (error) {
      console.error('[RecordService] Get by date range error:', error)
      throw new Error('获取记录失败')
    }
  }

  /**
   * 创建学习记录
   */
  static async create(input: StudyRecordCreateInput): Promise<StudyRecord> {
    try {
      const record = await prisma.studyRecord.create({
        data: {
          userId: this.DEFAULT_USER_ID,
          subject: input.subject,
          duration: input.duration,
          notes: input.notes
        }
      })

      // 更新每日统计
      await this.updateDailyStats(input)

      return record as StudyRecord
    } catch (error) {
      console.error('[RecordService] Create error:', error)
      throw new Error('创建记录失败')
    }
  }

  /**
   * 更新学习记录
   */
  static async update(id: string, input: Partial<StudyRecordCreateInput>): Promise<StudyRecord> {
    try {
      const record = await prisma.studyRecord.update({
        where: { id },
        data: {
          subject: input.subject,
          duration: input.duration,
          notes: input.notes
        }
      })

      return record as StudyRecord
    } catch (error) {
      console.error('[RecordService] Update error:', error)
      throw new Error('更新记录失败')
    }
  }

  /**
   * 删除学习记录
   */
  static async delete(id: string): Promise<void> {
    try {
      await prisma.studyRecord.delete({
        where: { id }
      })
    } catch (error) {
      console.error('[RecordService] Delete error:', error)
      throw new Error('删除记录失败')
    }
  }

  /**
   * 获取今日记录
   */
  static async getToday(): Promise<StudyRecord[]> {
    const today = new Date()
    const startDate = startOfDay(today)
    const endDate = endOfDay(today)

    return await this.getByDateRange(startDate, endDate)
  }

  /**
   * 获取学习时长统计
   */
  static async getDurationStats(days: number = 7): Promise<{
    total: number
    bySubject: Record<Subject, number>
    byDay: Array<{ date: string; duration: number }>
  }> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const records = await prisma.studyRecord.findMany({
      where: {
        userId: this.DEFAULT_USER_ID,
        createdAt: { gte: startDate }
      }
    })

    const total = records.reduce((sum, r) => sum + r.duration, 0)

    const bySubject: Record<Subject, number> = {
      [Subject.COMPUTER_408]: 0,
      [Subject.MATH]: 0,
      [Subject.ENGLISH]: 0,
      [Subject.POLITICS]: 0
    }

    records.forEach(record => {
      if (bySubject[record.subject] !== undefined) {
        bySubject[record.subject] += record.duration
      }
    })

    // 按天统计
    const byDayMap = new Map<string, number>()
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dateStr = date.toISOString().split('T')[0]
      byDayMap.set(dateStr, 0)
    }

    records.forEach(record => {
      const dateStr = new Date(record.createdAt).toISOString().split('T')[0]
      if (byDayMap.has(dateStr)) {
        byDayMap.set(dateStr, byDayMap.get(dateStr)! + record.duration)
      }
    })

    const byDay = Array.from(byDayMap.entries()).map(([date, duration]) => ({
      date,
      duration
    }))

    return { total, bySubject, byDay }
  }

  /**
   * 更新每日统计
   */
  private static async updateDailyStats(input: StudyRecordCreateInput): Promise<void> {
    const today = startOfDay(new Date())
    const subjectFieldMap: Record<Subject, string> = {
      [Subject.COMPUTER_408]: 'hours408',
      [Subject.MATH]: 'hoursMath',
      [Subject.ENGLISH]: 'hoursEnglish',
      [Subject.POLITICS]: 'hoursPolitics'
    }

    const subjectField = subjectFieldMap[input.subject]

    await prisma.dailyStatistic.upsert({
      where: {
        userId_date: {
          userId: this.DEFAULT_USER_ID,
          date: today
        }
      },
      update: {
        totalHours: { increment: input.duration },
        ...(subjectField && { [subjectField]: { increment: input.duration } })
      },
      create: {
        userId: this.DEFAULT_USER_ID,
        date: today,
        totalHours: input.duration,
        ...(subjectField && { [subjectField]: input.duration })
      }
    })
  }
}
