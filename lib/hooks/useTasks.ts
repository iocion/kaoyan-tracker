import { useState, useEffect, useCallback } from 'react'
import { Task, TaskCreateInput, Subject } from '@/types'

interface UseTasksReturn {
  tasks: Task[]
  isLoading: boolean
  activeTask: Task | null

  // 操作
  createTask: (input: TaskCreateInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setActiveTask: (id: string) => Promise<void>
  refresh: () => Promise<void>

  // 过滤
  getTasksBySubject: (subject: Subject) => Task[]
  getIncompleteTasks: () => Task[]
  getCompletedTasks: () => Task[]
}

/**
 * 任务管理 Hook
 * 管理任务列表和操作
 */
export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 获取活跃任务
  const activeTask = tasks.find(t => t.isActive) || null

  // 刷新任务列表
  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tasks')
      const result = await response.json()

      if (result.success) {
        setTasks(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 创建任务
  const createTask = useCallback(async (input: TaskCreateInput) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      const result = await response.json()

      if (result.success) {
        await refresh()
      } else {
        throw new Error(result.error || '创建任务失败')
      }
    } catch (error: any) {
      console.error('Failed to create task:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [refresh])

  // 删除任务
  const deleteTask = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const result = await response.json()

      if (result.success) {
        await refresh()
      } else {
        throw new Error(result.error || '删除任务失败')
      }
    } catch (error: any) {
      console.error('Failed to delete task:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [refresh])

  // 设置活跃任务
  const setActiveTask = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setActive', id })
      })
      const result = await response.json()

      if (result.success) {
        await refresh()
      } else {
        throw new Error(result.error || '设置任务失败')
      }
    } catch (error: any) {
      console.error('Failed to set active task:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [refresh])

  // 按学科筛选
  const getTasksBySubject = useCallback((subject: Subject): Task[] => {
    return tasks.filter(t => t.subject === subject)
  }, [tasks])

  // 获取未完成任务
  const getIncompleteTasks = useCallback((): Task[] => {
    return tasks.filter(t => !t.isCompleted)
  }, [tasks])

  // 获取已完成任务
  const getCompletedTasks = useCallback((): Task[] => {
    return tasks.filter(t => t.isCompleted)
  }, [tasks])

  // 初始加载
  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    tasks,
    isLoading,
    activeTask,
    createTask,
    deleteTask,
    setActiveTask,
    refresh,
    getTasksBySubject,
    getIncompleteTasks,
    getCompletedTasks
  }
}
