import { prisma } from '@/lib/prisma'
import {
  Pomodoro,
  PomodoroCreateInput,
  PomodoroUpdateInput,
  PomodoroType,
  PomodoroStatus,
  PomodoroStats
} from '@/types'
import { startOfDay, endOfDay, subDays, differenceInSeconds } from 'date-fns'

/**
 * 番茄钟服务
 * 封装所有番茄钟相关的业务逻辑
 */
export class PomodoroService {
  private static readonly DEFAULT_USER_ID = 'default'

  /**
   * 获取当前正在进行的番茄钟
   */
  static async getActive(): Promise<Pomodoro | null> {
    try {
      const activePomodoro = await prisma.pomodoro.findFirst({
        where: {
          userId: this.DEFAULT_USER_ID,
          status: { in: [PomodoroStatus.RUNNING, PomodoroStatus.PAUSED] }
        },
        include: {
          task: true
        }
      })

      return activePomodoro as Pomodoro | null
    } catch (error) {
      console.error('[PomodoroService] Get active error:', error)
      throw new Error('获取当前番茄钟失败')
    }
  }

  /**
   * 开始新的番茄钟
   */
  static async start(input: PomodoroCreateInput): Promise<Pomodoro> {
    try {
      // 先结束任何正在进行的番茄钟
      await this.cancelAllActive()

      // 创建新的番茄钟
      const pomodoro = await prisma.pomodoro.create({
        data: {
          userId: this.DEFAULT_USER_ID,
          taskId: input.taskId,
          type: input.type,
          status: PomodoroStatus.RUNNING,
          duration: input.duration * 60, // 转为秒
          elapsedTime: 0
        },
        include: {
          task: true
        }
      })

      return pomodoro as Pomodoro
    } catch (error) {
      console.error('[PomodoroService] Start error:', error)
      throw new Error('开始番茄钟失败')
    }
  }

  /**
   * 暂停番茄钟
   */
  static async pause(id: string): Promise<Pomodoro> {
    try {
      const pomodoro = await prisma.pomodoro.update({
        where: { id },
        data: {
          status: PomodoroStatus.PAUSED,
          pauseCount: { increment: 1 }
        },
        include: {
          task: true
        }
      })

      return pomodoro as Pomodoro
    } catch (error) {
      console.error('[PomodoroService] Pause error:', error)
      throw new Error('暂停番茄钟失败')
    }
  }

  /**
   * 继续番茄钟
   */
  static async resume(id: string): Promise<Pomodoro> {
    try {
      const pomodoro = await prisma.pomodoro.update({
        where: { id },
        data: {
          status: PomodoroStatus.RUNNING
        },
        include: {
          task: true
        }
      })

      return pomodoro as Pomodoro
    } catch (error) {
      console.error('[PomodoroService] Resume error:', error)
      throw new Error('继续番茄钟失败')
    }
  }

  /**
   * 完成番茄钟
   */
  static async complete(id: string): Promise<Pomodoro> {
    try {
      const pomodoro = await prisma.pomodoro.update({
        where: { id },
        data: {
          status: PomodoroStatus.COMPLETED,
          endedAt: new Date()
        },
        include: {
          task: true
        }
      })

      // 更新每日统计
      await this.updateDailyStats(pomodoro as Pomodoro)

      // 如果是专注且有任务，更新任务进度
      if (pomodoro.type === PomodoroType.FOCUS && pomodoro.taskId) {
        await this.updateTaskProgress(pomodoro.taskId)
      }

      return pomodoro as Pomodoro
    } catch (error) {
      console.error('[PomodoroService] Complete error:', error)
      throw new Error('完成番茄钟失败')
    }
  }

  /**
   * 取消番茄钟
   */
  static async cancel(id: string): Promise<Pomodoro> {
    try {
      const pomodoro = await prisma.pomodoro.update({
        where: { id },
        data: {
          status: PomodoroStatus.CANCELLED,
          endedAt: new Date()
        },
        include: {
          task: true
        }
      })

      return pomodoro as Pomodoro
    } catch (error) {
      console.error('[PomodoroService] Cancel error:', error)
      throw new Error('取消番茄钟失败')
    }
  }

  /**
   * 更新番茄钟（用于实时更新 elapsedTime）
   */
  static async update(id: string, input: PomodoroUpdateInput): Promise<Pomodoro> {
    try {
      const pomodoro = await prisma.pomodoro.update({
        where: { id },
        data: {
          status: input.status,
          elapsedTime: input.elapsedTime,
          ...(input.status === PomodoroStatus.PAUSED && { pauseCount: { increment: 1 } }),
          ...(input.status === PomodoroStatus.COMPLETED && { endedAt: new Date() }),
          ...(input.status === PomodoroStatus.CANCELLED && { endedAt: new Date() })
        },
        include: {
          task: true
        }
      })

      return pomodoro as Pomodoro
    } catch (error) {
      console.error('[PomodoroService] Update error:', error)
      throw new Error('更新番茄钟失败')
    }
  }

  /**
   * 取消所有活跃的番茄钟
   */
  private static async cancelAllActive(): Promise<void> {
    await prisma.pomodoro.updateMany({
      where: {
        userId: this.DEFAULT_USER_ID,
        status: { in: [PomodoroStatus.RUNNING, PomodoroStatus.PAUSED] }
      },
      data: {
        status: PomodoroStatus.CANCELLED,
        endedAt: new Date()
      }
    })
  }

  /**
   * 更新每日统计
   */
  private static async updateDailyStats(pomodoro: Pomodoro): Promise<void> {
    const today = startOfDay(new Date())
    const userId = pomodoro.userId

    // 获取学科字段映射
    const subjectField = await this.getSubjectField(pomodoro.taskId)

    // 更新或创建每日统计
    const updateData: any = {
      totalPomodoros: { increment: 1 },
      ...(pomodoro.type === PomodoroType.FOCUS && {
        totalFocusTime: { increment: pomodoro.elapsedTime }
      }),
      ...(pomodoro.type !== PomodoroType.FOCUS && {
        totalBreakTime: { increment: pomodoro.elapsedTime }
      })
    }

    const createData: any = {
      userId,
      date: today,
      totalPomodoros: 1,
      totalFocusTime: pomodoro.type === PomodoroType.FOCUS ? pomodoro.elapsedTime : 0,
      totalBreakTime: pomodoro.type !== PomodoroType.FOCUS ? pomodoro.elapsedTime : 0
    }

    if (subjectField) {
      updateData[subjectField] = { increment: 1 }
      createData[subjectField] = 1
    }

    await prisma.dailyStat.upsert({
      where: {
        userId_date: { userId, date: today }
      },
      update: updateData,
      create: createData
    })
  }

  /**
   * 更新任务进度
   */
  private static async updateTaskProgress(taskId: string): Promise<void> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { estimatedPomodoros: true, completedPomodoros: true }
    })

    if (!task) return

    const newCompletedPomodoros = task.completedPomodoros + 1
    const shouldComplete = newCompletedPomodoros >= task.estimatedPomodoros

    await prisma.task.update({
      where: { id: taskId },
      data: {
        completedPomodoros: { increment: 1 },
        isCompleted: shouldComplete,
        ...(shouldComplete && { completedAt: new Date() })
      }
    })
  }

  /**
   * 获取学科字段映射
   */
  private static async getSubjectField(taskId: string | null): Promise<string | null> {
    if (!taskId) return null

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { subject: true }
    })

    if (!task) return null

    const fieldMap: Record<string, string> = {
      COMPUTER_408: 'pomodoros408',
      MATH: 'pomodorosMath',
      ENGLISH: 'pomodorosEnglish',
      POLITICS: 'pomodorosPolitics'
    }

    return fieldMap[task.subject] || null
  }

  /**
   * 获取番茄钟统计数据
   */
  static async getStats(days: number = 7): Promise<PomodoroStats> {
    const startDate = startOfDay(subDays(new Date(), days - 1))
    const endDate = endOfDay(new Date())

    const pomodoros = await prisma.pomodoro.findMany({
      where: {
        userId: this.DEFAULT_USER_ID,
        startedAt: { gte: startDate, lte: endDate }
      }
    })

    const total = pomodoros.length
    const completed = pomodoros.filter(p => p.status === PomodoroStatus.COMPLETED).length
    const cancelled = pomodoros.filter(p => p.status === PomodoroStatus.CANCELLED).length

    const totalFocusTime = pomodoros
      .filter(p => p.type === PomodoroType.FOCUS && p.status === PomodoroStatus.COMPLETED)
      .reduce((sum, p) => sum + p.elapsedTime, 0)

    const totalBreakTime = pomodoros
      .filter(p => p.type !== PomodoroType.FOCUS && p.status === PomodoroStatus.COMPLETED)
      .reduce((sum, p) => sum + p.elapsedTime, 0)

    const avgDuration = completed > 0
      ? Math.round(pomodoros.reduce((sum, p) => sum + p.elapsedTime, 0) / completed)
      : 0

    const byType = {
      [PomodoroType.FOCUS]: pomodoros.filter(p => p.type === PomodoroType.FOCUS).length,
      [PomodoroType.BREAK]: pomodoros.filter(p => p.type === PomodoroType.BREAK).length,
      [PomodoroType.LONG_BREAK]: pomodoros.filter(p => p.type === PomodoroType.LONG_BREAK).length
    }

    // 按天统计
    const byDayMap = new Map<string, { count: number; focusTime: number }>()
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      byDayMap.set(date.toISOString(), { count: 0, focusTime: 0 })
    }

    pomodoros.forEach(p => {
      const dateKey = startOfDay(p.startedAt).toISOString()
      const entry = byDayMap.get(dateKey)
      if (entry) {
        entry.count++
        if (p.type === PomodoroType.FOCUS && p.status === PomodoroStatus.COMPLETED) {
          entry.focusTime += p.elapsedTime
        }
      }
    })

    const byDay = Array.from(byDayMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      focusTime: data.focusTime
    }))

    return {
      total,
      completed,
      cancelled,
      totalFocusTime,
      totalBreakTime,
      avgDuration,
      byType,
      byDay
    }
  }

  /**
   * 获取历史记录
   */
  static async getHistory(limit: number = 20): Promise<Pomodoro[]> {
    const pomodoros = await prisma.pomodoro.findMany({
      where: {
        userId: this.DEFAULT_USER_ID,
        status: { in: [PomodoroStatus.COMPLETED, PomodoroStatus.CANCELLED] }
      },
      include: {
        task: true
      },
      orderBy: { startedAt: 'desc' },
      take: limit
    })

    return pomodoros as Pomodoro[]
  }
}
