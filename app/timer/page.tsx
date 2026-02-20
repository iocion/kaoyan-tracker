'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

interface Task {
  id: string
  title: string
}

/**
 * 番茄钟页面 - 精简版
 * 只保留已实现后端 API 的功能
 */
export default function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [sessionActive, setSessionActive] = useState(false)

  const totalTime = 25 * 60

  // 加载活跃任务
  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const active = data.data?.find((t: any) => t.isActive)
          if (active) setCurrentTask(active)
          setTasks(data.data?.filter((t: any) => !t.isCompleted) || [])
        }
      })
  }, [])

  // 计时器逻辑
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return
    
    const interval = setInterval(() => {
      setTimeLeft(t => t - 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  // 时间到自动完成
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      completeSession()
    }
  }, [timeLeft, isRunning])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const startSession = async () => {
    try {
      await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'FOCUS',
          duration: totalTime,
          taskId: currentTask?.id || null
        })
      })
      setSessionActive(true)
      setIsRunning(true)
    } catch (err) {
      console.error('开始失败:', err)
    }
  }

  const toggleTimer = async () => {
    if (!sessionActive && !isRunning) {
      await startSession()
      return
    }

    const action = isRunning ? 'pause' : 'resume'
    
    try {
      await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      setIsRunning(!isRunning)
    } catch (err) {
      console.error('切换失败:', err)
    }
  }

  const completeSession = async () => {
    setIsRunning(false)
    
    try {
      await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' })
      })
      
      // 更新任务番茄数
      if (currentTask) {
        await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'updatePomodoroCount', id: currentTask.id })
        })
      }
      
      setSessionActive(false)
    } catch (err) {
      console.error('完成失败:', err)
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(totalTime)
    setSessionActive(false)
  }

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-8">番茄钟</h1>

      {/* 圆形进度条 */}
      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke={colors.primary}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold tabular-nums">{formatTime(timeLeft)}</div>
            <div className="text-gray-500 mt-2">{isRunning ? '专注中' : '准备开始'}</div>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={resetTimer}
          className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button
          onClick={toggleTimer}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors ${
            isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#60a5fa] hover:bg-[#3b82f6]'
          }`}
        >
          {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
        </button>
      </div>

      {/* 当前任务 */}
      {currentTask ? (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">当前任务</div>
          <div className="font-medium">{currentTask.title}</div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-500">
          在任务列表中选择一个任务开始专注
        </div>
      )}
    </div>
  )
}
