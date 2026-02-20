'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Check, Trash2 } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

interface Task {
  id: string
  title: string
  subject: string
  estimatedPomodoros: number
  completedPomodoros: number
  isCompleted: boolean
  isActive: boolean
}

/**
 * 任务管理页面 - 精简版
 * 只保留已实现后端 API 的功能
 */
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')

  // 加载任务列表
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      if (data.success) setTasks(data.data || [])
    } catch (err) {
      console.error('加载任务失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 添加任务
  const addTask = async () => {
    if (!newTask.trim()) return
    
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask,
          subject: 'COMPUTER_408',
          estimatedPomodoros: 1
        })
      })
      const data = await res.json()
      if (data.success) {
        setTasks([data.data, ...tasks])
        setNewTask('')
      }
    } catch (err) {
      alert('添加任务失败')
    }
  }

  // 切换完成状态
  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id, isCompleted: !task.isCompleted })
      })
      if (res.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
      }
    } catch (err) {
      alert('更新失败')
    }
  }

  // 设置活跃任务
  const setActive = async (id: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setActive', id })
      })
      if (res.ok) {
        setTasks(tasks.map(t => ({ ...t, isActive: t.id === id })))
      }
    } catch (err) {
      alert('设置失败')
    }
  }

  // 删除任务
  const deleteTask = async (id: string) => {
    if (!confirm('确定删除？')) return
    
    try {
      const res = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id))
      }
    } catch (err) {
      alert('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-12 text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">任务列表</h1>

      {/* 添加任务 */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="添加新任务..."
          className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#60a5fa]"
        />
        <button
          onClick={addTask}
          className="px-4 py-3 rounded-xl bg-[#60a5fa] text-white font-medium hover:bg-[#3b82f6] transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-xl transition-all ${
              task.isCompleted ? 'bg-gray-100 opacity-60' : 'bg-white shadow-sm'
            } ${task.isActive ? 'ring-2 ring-[#60a5fa]' : ''}`}
          >
            <div className="flex items-center gap-3">
              {/* 完成按钮 */}
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.isCompleted
                    ? 'bg-[#60a5fa] border-[#60a5fa]'
                    : 'border-gray-300 hover:border-[#60a5fa]'
                }`}
              >
                {task.isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
              </button>

              {/* 任务内容 */}
              <div
                className={`flex-1 cursor-pointer ${
                  task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
                onClick={() => setActive(task.id)}
              >
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-gray-500">
                  {task.completedPomodoros}/{task.estimatedPomodoros} 番茄
                  {task.isActive && <span className="ml-2 text-[#60a5fa]">进行中</span>}
                </div>
              </div>

              {/* 删除按钮 */}
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无任务，添加一个开始吧
        </div>
      )}
    </div>
  )
}
