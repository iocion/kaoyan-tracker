'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Check, Clock, Trash2, Calendar, Tag, RefreshCw } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

interface Task {
  id: string
  title: string
  subject: string
  estimatedPomodoros: number
  completedPomodoros: number
  isCompleted: boolean
  isActive: boolean
  createdAt: string
  completedAt?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

/**
 * 任务管理页面 - Apple Reminders 风格
 * 已连接到后端 API
 */
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // 加载任务
  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      const data: ApiResponse<Task[]> = await response.json()

      if (data.success && data.data) {
        setTasks(data.data)
      }
    } catch (error) {
      console.error('加载任务失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  // 添加任务
  const addTask = async () => {
    if (!newTask.trim()) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask,
          subject: 'COMPUTER_408', // 默认科目
          estimatedPomodoros: 1,
        }),
      })

      const data: ApiResponse<Task> = await response.json()

      if (data.success && data.data) {
        setTasks([data.data, ...tasks])
        setNewTask('')
      } else {
        alert(data.error || '添加任务失败')
      }
    } catch (error) {
      console.error('添加任务失败:', error)
      alert('添加任务失败')
    }
  }

  // 切换任务状态
  const toggleTask = async (id: string) => {
    try {
      // 找到要切换的任务
      const task = tasks.find(t => t.id === id)
      if (!task) return

      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          id,
          isCompleted: !task.isCompleted,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTasks(tasks.map(t =>
          t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
        ))
      } else {
        alert(data.error || '更新任务失败')
      }
    } catch (error) {
      console.error('更新任务失败:', error)
      alert('更新任务失败')
    }
  }

  // 设置当前活跃任务
  const setActiveTask = async (id: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setActive',
          id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTasks(tasks.map(t => ({
          ...t,
          isActive: t.id === id,
        })))
      }
    } catch (error) {
      console.error('设置活跃任务失败:', error)
    }
  }

  // 删除任务
  const deleteTask = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const data = await response.json()

      if (data.success) {
        setTasks(tasks.filter(t => t.id !== id))
      } else {
        alert(data.error || '删除任务失败')
      }
    } catch (error) {
      console.error('删除任务失败:', error)
      alert('删除任务失败')
    }
  }

  // 刷新任务列表
  const refreshTasks = async () => {
    setRefreshing(true)
    await loadTasks()
    setRefreshing(false)
  }

  // 格式化科目名称
  const getSubjectName = (subject: string) => {
    const map: Record<string, string> = {
      'COMPUTER_408': '计算机',
      'MATH': '数学',
      'ENGLISH': '英语',
      'POLITICS': '政治',
    }
    return map[subject] || subject
  }

  // 获取科目颜色
  const getSubjectColor = (subject: string) => {
    const map: Record<string, string> = {
      'COMPUTER_408': colors.subjectMath,
      'MATH': colors.subjectMath,
      'ENGLISH': colors.subjectEnglish,
      'POLITICS': colors.subjectPolitics,
    }
    return map[subject] || colors.primary
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-[#60a5fa] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">任务列表</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理你的考研任务</p>
        </div>
        <button
          onClick={refreshTasks}
          disabled={refreshing}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 添加任务 */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="添加新任务..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#60a5fa] dark:focus:ring-[#3b82f6] transition-all"
          />
          <button
            onClick={addTask}
            className="px-6 py-3 rounded-2xl bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-medium transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">添加</span>
          </button>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`
              p-4 rounded-2xl transition-all duration-200
              ${task.isCompleted
                ? 'bg-gray-100 dark:bg-gray-800/50 opacity-60'
                : 'bg-white dark:bg-gray-900 shadow-sm hover:shadow-md'
              }
              ${task.isActive ? 'ring-2 ring-[#60a5fa]' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              {/* 完成按钮 */}
              <button
                onClick={() => toggleTask(task.id)}
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-0.5
                  ${task.isCompleted
                    ? 'bg-[#60a5fa] border-[#60a5fa]'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#60a5fa]'
                  }
                `}
              >
                {task.isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
              </button>

              {/* 任务内容 */}
              <div className="flex-1 min-w-0">
                <div className={`
                  font-medium mb-1 cursor-pointer
                  ${task.isCompleted
                    ? 'text-gray-500 dark:text-gray-500 line-through'
                    : 'text-gray-900 dark:text-white'
                  }
                  `}
                  onClick={() => setActiveTask(task.id)}
                >
                  {task.title}
                </div>

                {/* 任务标签 */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-white font-medium"
                    style={{ backgroundColor: getSubjectColor(task.subject) }}
                  >
                    <Tag className="w-3 h-3" />
                    {getSubjectName(task.subject)}
                  </span>

                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {task.completedPomodoros}/{task.estimatedPomodoros} 番茄
                  </span>

                  {task.isActive && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#60a5fa] text-white font-medium">
                      进行中
                    </span>
                  )}
                </div>
              </div>

              {/* 删除按钮 */}
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Check className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            所有任务已完成！
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            添加新任务开始高效学习
          </p>
        </div>
      )}

      {/* 统计 */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {tasks.filter(t => t.isCompleted).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            已完成
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {tasks.filter(t => !t.isCompleted).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            待完成
          </div>
        </div>
      </div>
    </div>
  )
}
