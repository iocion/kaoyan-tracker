'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Check, SkipForward } from 'lucide-react'
import { colors } from '@/lib/styles/colors'

/**
 * Apple 风格番茄钟页面
 * 圆环计时器，类似 iOS 时钟
 */
export default function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const totalTime = 25 * 60

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
    } else if (timeLeft === 0) {
      setIsRunning(false)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, totalTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(25 * 60)
    setProgress(0)
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
          className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <SkipForward className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* 当前任务 */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">当前任务</h3>
          <button className="text-[#60a5fa] hover:text-[#3b82f6] text-sm font-medium">
            切换任务
          </button>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
          <div className="w-12 h-12 rounded-xl bg-[#60a5fa] flex items-center justify-center">
            <span className="text-white font-bold">408</span>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">数据结构 - 复习二叉树</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">预计 2 个番茄 · 已完成 1 个</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
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
