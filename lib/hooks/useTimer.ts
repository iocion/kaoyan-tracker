import { useState, useEffect, useCallback, useRef } from 'react'
import { Pomodoro, PomodoroType, PomodoroStatus } from '@/types'

interface UseTimerOptions {
  onTick?: (elapsedTime: number) => void
  onComplete?: () => void
  onError?: (error: string) => void
}

interface UseTimerReturn {
  pomodoro: Pomodoro | null
  isLoading: boolean
  isRunning: boolean
  isPaused: boolean
  remaining: number // 剩余秒数
  progress: number // 进度百分比 0-100

  // 操作
  start: (taskId?: string, type?: PomodoroType, duration?: number) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  complete: () => Promise<void>
  cancel: () => Promise<void>
  refresh: () => Promise<void>

  // 工具
  formatTime: (seconds: number) => string
}

/**
 * 番茄钟 Hook
 * 管理番茄钟状态和操作
 */
export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const [pomodoro, setPomodoro] = useState<Pomodoro | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { onTick, onComplete, onError } = options

  // 计算剩余时间
  const remaining = pomodoro
    ? Math.max(0, pomodoro.duration - pomodoro.elapsedTime)
    : 0

  // 计算进度
  const progress = pomodoro
    ? (pomodoro.elapsedTime / pomodoro.duration) * 100
    : 0

  // 判断状态
  const isRunning = pomodoro?.status === PomodoroStatus.RUNNING
  const isPaused = pomodoro?.status === PomodoroStatus.PAUSED

  // 获取当前番茄钟
  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/pomodoro')
      const result = await response.json()

      if (result.success) {
        setPomodoro(result.data)
      } else {
        onError?.(result.error || '获取番茄钟失败')
      }
    } catch (error) {
      onError?.('网络错误')
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  // 开始番茄钟
  const start = useCallback(async (
    taskId?: string,
    type: PomodoroType = PomodoroType.FOCUS,
    duration: number = 25
  ) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, type, duration })
      })
      const result = await response.json()

      if (result.success) {
        setPomodoro(result.data)
      } else {
        onError?.(result.error || '开始失败')
      }
    } catch (error) {
      onError?.('网络错误')
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  // 暂停
  const pause = useCallback(async () => {
    if (!pomodoro) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pause',
          id: pomodoro.id
        })
      })
      const result = await response.json()

      if (result.success) {
        setPomodoro(result.data)
      } else {
        onError?.(result.error || '暂停失败')
      }
    } catch (error) {
      onError?.('网络错误')
    } finally {
      setIsLoading(false)
    }
  }, [pomodoro, onError])

  // 继续
  const resume = useCallback(async () => {
    if (!pomodoro) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resume',
          id: pomodoro.id
        })
      })
      const result = await response.json()

      if (result.success) {
        setPomodoro(result.data)
      } else {
        onError?.(result.error || '继续失败')
      }
    } catch (error) {
      onError?.('网络错误')
    } finally {
      setIsLoading(false)
    }
  }, [pomodoro, onError])

  // 完成
  const complete = useCallback(async () => {
    if (!pomodoro) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          id: pomodoro.id
        })
      })
      const result = await response.json()

      if (result.success) {
        setPomodoro(null)
        onComplete?.()
      } else {
        onError?.(result.error || '完成失败')
      }
    } catch (error) {
      onError?.('网络错误')
    } finally {
      setIsLoading(false)
    }
  }, [pomodoro, onError, onComplete])

  // 取消
  const cancel = useCallback(async () => {
    if (!pomodoro) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          id: pomodoro.id
        })
      })
      const result = await response.json()

      if (result.success) {
        setPomodoro(null)
      } else {
        onError?.(result.error || '取消失败')
      }
    } catch (error) {
      onError?.('网络错误')
    } finally {
      setIsLoading(false)
    }
  }, [pomodoro, onError])

  // 定时器
  useEffect(() => {
    if (isRunning && pomodoro) {
      intervalRef.current = setInterval(async () => {
        const newElapsedTime = pomodoro.elapsedTime + 1

        // 更新本地状态
        setPomodoro(prev => prev ? { ...prev, elapsedTime: newElapsedTime } : null)

        // 触发回调
        onTick?.(newElapsedTime)

        // 同步到服务器（每 10 秒一次）
        if (newElapsedTime % 10 === 0) {
          try {
            await fetch('/api/pomodoro', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'update',
                id: pomodoro.id,
                status: PomodoroStatus.RUNNING,
                elapsedTime: newElapsedTime
              })
            })
          } catch (error) {
            // 静默失败，不影响本地计时
          }
        }

        // 检查是否完成
        if (newElapsedTime >= pomodoro.duration) {
          await complete()
        }
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, pomodoro, onTick, complete])

  // 初始加载
  useEffect(() => {
    refresh()
  }, [refresh])

  // 格式化时间
  const formatTime = useCallback((seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, [])

  return {
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
    refresh,
    formatTime
  }
}
