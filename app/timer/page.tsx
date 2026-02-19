'use client'

import { useTimer } from '@/lib/hooks/useTimer'
import { useTasks } from '@/lib/hooks/useTasks'
import { useSettings } from '@/lib/hooks/useSettings'
import { PomodoroType, Subject } from '@/types'
import { Play, Pause, RotateCcw, Check, Plus, Clock, Target } from 'lucide-react'

export default function TimerPage() {
  const {
    pomodoro,
    isLoading,
    isRunning,
    isPaused,
    remaining,
    progress,
    start,
    pause,
    resume,
    complete,
    cancel,
    formatTime
  } = useTimer({
    onComplete: () => {
      // 完成时可以播放声音或显示通知
      console.log('番茄钟完成！')
    }
  })

  const {
    tasks,
    activeTask,
    createTask,
    setActiveTask,
    getIncompleteTasks
  } = useTasks()

  const { settings } = useSettings()

  const incompleteTasks = getIncompleteTasks()

  // 开始专注
  const handleStartFocus = async (taskId?: string) => {
    try {
      console.log('[Timer] Starting focus with taskId:', taskId)
      const duration = settings?.focusDuration || 25
      await start(taskId, PomodoroType.FOCUS, duration)
      console.log('[Timer] Focus started successfully')
    } catch (error) {
      console.error('[Timer] Failed to start focus:', error)
      alert('开始专注失败，请稍后重试')
    }
  }

  // 开始休息
  const handleStartBreak = async () => {
    try {
      console.log('[Timer] Starting break')
      const duration = settings?.breakDuration || 5
      await start(null, PomodoroType.BREAK, duration)
      console.log('[Timer] Break started successfully')
    } catch (error) {
      console.error('[Timer] Failed to start break:', error)
      alert('开始休息失败，请稍后重试')
    }
  }

  // 开始长休息
  const handleStartLongBreak = async () => {
    try {
      console.log('[Timer] Starting long break')
      const duration = settings?.longBreakDuration || 15
      await start(null, PomodoroType.LONG_BREAK, duration)
      console.log('[Timer] Long break started successfully')
    } catch (error) {
      console.error('[Timer] Failed to start long break:', error)
      alert('开始长休息失败，请稍后重试')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🍅 考研番茄钟
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            专注当下，成就未来
          </p>
        </div>

        {/* 主计时器 */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {/* 任务信息 */}
            {activeTask && pomodoro?.taskId === activeTask.id && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {activeTask.title}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  进度: {activeTask.completedPomodoros} / {activeTask.estimatedPomodoros} 番茄
                </div>
              </div>
            )}

            {/* 时间显示 */}
            <div className="text-center mb-8">
              <div className="text-7xl font-bold text-gray-900 dark:text-white mb-4">
                {formatTime(remaining)}
              </div>

              {/* 进度条 */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* 类型标签 */}
              {pomodoro && (
                <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {pomodoro.type === PomodoroType.FOCUS && '专注时间'}
                    {pomodoro.type === PomodoroType.BREAK && '短休息'}
                    {pomodoro.type === PomodoroType.LONG_BREAK && '长休息'}
                  </span>
                </div>
              )}
            </div>

            {/* 控制按钮 */}
            <div className="flex justify-center gap-4">
              {!pomodoro ? (
                // 未开始状态
                <>
                  <button
                    onClick={() => handleStartFocus(activeTask?.id)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    开始专注
                  </button>
                  <button
                    onClick={handleStartBreak}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    短休息
                  </button>
                  <button
                    onClick={handleStartLongBreak}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    长休息
                  </button>
                </>
              ) : isRunning ? (
                // 运行状态
                <>
                  <button
                    onClick={pause}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Pause className="w-5 h-5" />
                    暂停
                  </button>
                  <button
                    onClick={complete}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                    完成
                  </button>
                  <button
                    onClick={cancel}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-5 h-5" />
                    取消
                  </button>
                </>
              ) : isPaused ? (
                // 暂停状态
                <>
                  <button
                    onClick={resume}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    继续
                  </button>
                  <button
                    onClick={complete}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                    完成
                  </button>
                  <button
                    onClick={cancel}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-5 h-5" />
                    取消
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* 任务选择 */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                📋 任务列表
              </h2>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加任务
              </button>
            </div>

            {/* 任务列表 */}
            {incompleteTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">📝</div>
                <p>还没有任务，添加一个开始吧！</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {incompleteTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      task.isActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {task.subject === Subject.COMPUTER_408 && '408'}
                            {task.subject === Subject.MATH && '数学'}
                            {task.subject === Subject.ENGLISH && '英语'}
                            {task.subject === Subject.POLITICS && '政治'}
                          </span>
                          <span>
                            {task.completedPomodoros} / {task.estimatedPomodoros} 番茄
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTask(task.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          task.isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {task.isActive ? '当前任务' : '设为当前'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
