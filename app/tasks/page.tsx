'use client'

import { useState } from 'react'
import { PlusCircle, Check, Clock, X, Trash2, Calendar, Tag } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

/**
 * 任务管理页面 - Apple Reminders 风格
 */
export default function TasksPage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: '完成数据结构作业',
      subject: '计算机',
      priority: 'high',
      completed: false,
      dueDate: '今天',
      estimatedPomodoros: 2,
    },
    {
      id: 2,
      title: '复习英语单词 Unit 5',
      subject: '英语',
      priority: 'medium',
      completed: false,
      dueDate: '明天',
      estimatedPomodoros: 1,
    },
    {
      id: 3,
      title: '整理数学笔记',
      subject: '数学',
      priority: 'low',
      completed: true,
      dueDate: '已完成',
      estimatedPomodoros: 1,
    },
  ])

  const [newTask, setNewTask] = useState('')

  const addTask = () => {
    if (!newTask.trim()) return

    const task = {
      id: Date.now(),
      title: newTask,
      subject: '其他',
      priority: 'medium',
      completed: false,
      dueDate: '今天',
      estimatedPomodoros: 1,
    }

    setTasks([task, ...tasks])
    setNewTask('')
  }

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.danger
      case 'medium': return colors.warning
      case 'low': return colors.success
      default: return colors.textSecondary
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return ''
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">任务列表</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">管理你的考研任务</p>
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
              ${task.completed
                ? 'bg-gray-100 dark:bg-gray-800/50 opacity-60'
                : 'bg-white dark:bg-gray-900 shadow-sm hover:shadow-md'
              }
            `}
          >
            <div className="flex items-start gap-3">
              {/* 完成按钮 */}
              <button
                onClick={() => toggleTask(task.id)}
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-0.5
                  ${task.completed
                    ? 'bg-[#60a5fa] border-[#60a5fa]'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#60a5fa]'
                  }
                `}
              >
                {task.completed && <Check className="w-3.5 h-3.5 text-white" />}
              </button>

              {/* 任务内容 */}
              <div className="flex-1 min-w-0">
                <div className={`
                  font-medium mb-1
                  ${task.completed
                    ? 'text-gray-500 dark:text-gray-500 line-through'
                    : 'text-gray-900 dark:text-white'
                  }
                `}>
                  {task.title}
                </div>

                {/* 任务标签 */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <Tag className="w-3 h-3" />
                    {task.subject}
                  </span>

                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {task.estimatedPomodoros} 番茄
                  </span>

                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {task.dueDate}
                  </span>

                  <span
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-white font-medium"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  >
                    {getPriorityLabel(task.priority)}
                  </span>
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
            {tasks.filter(t => t.completed).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            已完成
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {tasks.filter(t => !t.completed).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            待完成
          </div>
        </div>
      </div>
    </div>
  )
}
