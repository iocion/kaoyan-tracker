'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Plus } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

interface PomodoroData {
  id: string
  taskId?: string | null
  type: 'FOCUS' | 'BREAK' | 'LONG_BREAK'
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  duration: number
  elapsedTime: number
  startedAt: string
}

interface Task {
  id: string
  title: string
  subject: string
}

/**
 * Apple 风格番茄钟页面
 * 圆环计时器，类似 iOS 时钟
 */
export default function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [showTaskList, setShowTaskList] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [sessionStarted, setSessionStarted] = useState(false)
  const totalTime = 25 * 60

  // 加载当前活跃任务
  useEffect(() => {
    loadActiveTask()
    loadTasks()
  }, [])

  // 计时器逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1
          setProgress(((totalTime - newTime) / totalTime) * 100)
          return newTime
        })
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      // 番茄钟完成
      handleComplete()
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, totalTime])

  const loadActiveTask = async () => {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()

      if (data.success && data.data) {
        const activeTask = data.data.find((t: Task) => (t as any).isActive)
        if (activeTask) {
          setCurrentTask(activeTask)
        }
      }
    } catch (error) {
      console.error('加载任务失败:', error)
    }
  }

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()

      if (data.success && data.data) {
        setTasks(data.data.filter((t: Task) => !(t as any).isCompleted))
      }
    } catch (error) {
      console.error('加载任务列表失败:', error)
    }
  }

  const startSession = async () => {
    setSessionStarted(true)

    try {
      const response = await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'FOCUS',
          duration: totalTime,
          taskId: currentTask?.id || null,
        }),
      })

      const data = await response.json()
      if (!data.success) {
        console.error('开始会话失败:', data.error)
      }
    } catch (error) {
      console.error('开始会话失败:', error)
    }
  }

  const handleComplete = async () => {
    setIsRunning(false)

    try {
      const response = await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
        }),
      })

      const data = await response.json()
      if (data.success) {
        // 如果有任务关联，更新任务的番茄数
        if (currentTask) {
          await fetch('/api/tasks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'updatePomodoroCount',
              id: currentTask.id,
            }),
          })
        }
      }
    } catch (error) {
      console.error('完成会话失败:', error)
    }
  }

  const toggleTimer = async () => {
    if (!sessionStarted && !isRunning) {
      await startSession()
    }

    setIsRunning(!isRunning)

    try {
      const action = isRunning ? 'pause' : 'resume'
      await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
    } catch (error) {
      console.error('更新会话状态失败:', error)
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(25 * 60)
    setProgress(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const selectTask = (task: Task) => {
    setCurrentTask(task)
    setShowTaskList(false)
  }

  // 圆环进度计算
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">番茄钟</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">专注当下，成就未来</p>
      </div>

      {/* 圆环计时器 - iOS 风格 */}
      <div className="flex justify-center mb-12">
        <div className="relative">
          {/* 外圈背景 */}
          <svg className="transform -rotate-90 w-80 h-80">
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke={colors.primary}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* 中心时间显示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-gray-900 dark:text-white tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <div className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              {isRunning ? '专注中' : '准备开始'}
            </div>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center gap-4 mb-12">
        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>

        <button
          onClick={toggleTimer}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            isRunning
              ? 'bg-[#f59e0b] hover:bg-[#d97706]'
              : 'bg-[#60a5fa] hover:bg-[#3b82f6]'
          }`}
        >
          {isRunning ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </button>

        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <SkipForward className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* 当前任务 */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">当前任务</h3>

          {/* 任务选择器 */}
          <div className="relative">
            <button
              onClick={() => setShowTaskList(!showTaskList)}
              className="text-[#60a5fa] hover:text-[#3b82f6] text-sm font-medium flex items-center gap-1"
            >
              {currentTask ? '切换任务' : '选择任务'}
              <Plus className="w-4 h-4" />
            </button>

            {/* 任务下拉列表 */}
            {showTaskList && (
              <div className="absolute right-0 top-10 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                {tasks.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    没有可用任务
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    <div
                      onClick={() => selectTask(null as any)}
                      className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        !currentTask ? 'bg-[#60a5fa]/10' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        无任务
                      </div>
                    </div>
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => selectTask(task)}
                        className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          currentTask?.id === task.id ? 'bg-[#60a5fa]/10' : ''
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {task.subject}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {currentTask ? (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <div className="w-12 h-12 rounded-xl bg-[#60a5fa] flex items-center justify-center">
              <span className="text-white font-bold text-sm">408</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">{currentTask.title}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentTask.subject}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <div className="flex-1 text-center text-gray-500 dark:text-gray-400">
              点击上方按钮选择任务
            </div>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: '今日番茄', value: '4' },
          { label: '专注时长', value: '2h 15m' },
          { label: '任务进度', value: '50%' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm"
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
