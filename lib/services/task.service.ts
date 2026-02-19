import { prisma } from '@/lib/prisma'
import { Task, TaskCreateInput, TaskUpdateInput, Subject } from '@/types'

/**
 * 任务服务
 * 封装所有任务相关的业务逻辑
 */
export class TaskService {
  private static readonly DEFAULT_USER_ID = 'default'

  /**
   * 获取所有任务
   */
  static async getAll(): Promise<Task[]> {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: this.DEFAULT_USER_ID },
        include: {
          pomodoros: {
            where: {
              status: 'COMPLETED'
            },
            select: {
              id: true
            }
          }
        },
        orderBy: [
          { isActive: 'desc' },
          { isCompleted: 'asc' },
          { createdAt: 'desc' }
        ]
      })

      return tasks as Task[]
    } catch (error) {
      console.error('[TaskService] Get all error:', error)
      throw new Error('获取任务列表失败')
    }
  }

  /**
   * 根据 ID 获取任务
   */
  static async getById(id: string): Promise<Task | null> {
    try {
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          pomodoros: true
        }
      })

      return task as Task | null
    } catch (error) {
      console.error('[TaskService] Get by id error:', error)
      throw new Error('获取任务失败')
    }
  }

  /**
   * 获取当前活跃的任务
   */
  static async getActive(): Promise<Task | null> {
    try {
      const task = await prisma.task.findFirst({
        where: {
          userId: this.DEFAULT_USER_ID,
          isActive: true
        },
        include: {
          pomodoros: {
            where: {
              status: 'COMPLETED'
            },
            select: {
              id: true
            }
          }
        }
      })

      return task as Task | null
    } catch (error) {
      console.error('[TaskService] Get active error:', error)
      throw new Error('获取当前任务失败')
    }
  }

  /**
   * 创建新任务
   */
  static async create(input: TaskCreateInput): Promise<Task> {
    try {
      // 如果有其他激活的任务，先取消激活
      await prisma.task.updateMany({
        where: { userId: this.DEFAULT_USER_ID, isActive: true },
        data: { isActive: false }
      })

      // 创建新任务
      const task = await prisma.task.create({
        data: {
          userId: this.DEFAULT_USER_ID,
          title: input.title,
          subject: input.subject,
          estimatedPomodoros: input.estimatedPomodoros || 1,
          isActive: true, // 新创建的任务自动设为当前任务
          completedPomodoros: 0
        }
      })

      return task as Task
    } catch (error) {
      console.error('[TaskService] Create error:', error)
      throw new Error('创建任务失败')
    }
  }

  /**
   * 更新任务
   */
  static async update(id: string, input: TaskUpdateInput): Promise<Task> {
    try {
      // 如果设置为活跃，先取消其他任务的活跃状态
      if (input.isActive) {
        await prisma.task.updateMany({
          where: {
            userId: this.DEFAULT_USER_ID,
            isActive: true,
            id: { not: id }
          },
          data: { isActive: false }
        })
      }

      // 如果标记为完成，记录完成时间
      const updateData: any = { ...input }
      if (input.isCompleted && !input.completedAt) {
        updateData.completedAt = new Date()
      }

      const task = await prisma.task.update({
        where: { id },
        data: updateData
      })

      return task as Task
    } catch (error) {
      console.error('[TaskService] Update error:', error)
      throw new Error('更新任务失败')
    }
  }

  /**
   * 删除任务
   */
  static async delete(id: string): Promise<void> {
    try {
      await prisma.task.delete({
        where: { id }
      })
    } catch (error) {
      console.error('[TaskService] Delete error:', error)
      throw new Error('删除任务失败')
    }
  }

  /**
   * 设置活跃任务
   */
  static async setActive(id: string): Promise<Task> {
    try {
      // 先取消所有任务的活跃状态
      await prisma.task.updateMany({
        where: { userId: this.DEFAULT_USER_ID, isActive: true },
        data: { isActive: false }
      })

      // 设置目标任务为活跃
      const task = await prisma.task.update({
        where: { id },
        data: { isActive: true }
      })

      return task as Task
    } catch (error) {
      console.error('[TaskService] Set active error:', error)
      throw new Error('设置当前任务失败')
    }
  }

  /**
   * 获取任务统计
   */
  static async getStats(): Promise<{
    total: number
    completed: number
    inProgress: number
    bySubject: Record<Subject, number>
  }> {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: this.DEFAULT_USER_ID }
      })

      const total = tasks.length
      const completed = tasks.filter(t => t.isCompleted).length
      const inProgress = tasks.filter(t => !t.isCompleted).length

      const bySubject = {
        [Subject.COMPUTER_408]: tasks.filter(t => t.subject === Subject.COMPUTER_408).length,
        [Subject.MATH]: tasks.filter(t => t.subject === Subject.MATH).length,
        [Subject.ENGLISH]: tasks.filter(t => t.subject === Subject.ENGLISH).length,
        [Subject.POLITICS]: tasks.filter(t => t.subject === Subject.POLITICS).length
      }

      return { total, completed, inProgress, bySubject }
    } catch (error) {
      console.error('[TaskService] Get stats error:', error)
      throw new Error('获取任务统计失败')
    }
  }

  /**
   * 按学科筛选任务
   */
  static async getBySubject(subject: Subject): Promise<Task[]> {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          userId: this.DEFAULT_USER_ID,
          subject
        },
        orderBy: [
          { isActive: 'desc' },
          { isCompleted: 'asc' },
          { createdAt: 'desc' }
        ]
      })

      return tasks as Task[]
    } catch (error) {
      console.error('[TaskService] Get by subject error:', error)
      throw new Error('获取任务失败')
    }
  }

  /**
   * 获取未完成的任务
   */
  static async getIncomplete(): Promise<Task[]> {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          userId: this.DEFAULT_USER_ID,
          isCompleted: false
        },
        orderBy: [
          { isActive: 'desc' },
          { createdAt: 'desc' }
        ]
      })

      return tasks as Task[]
    } catch (error) {
      console.error('[TaskService] Get incomplete error:', error)
      throw new Error('获取未完成任务失败')
    }
  }
}
