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
  remaining: number
  progress: number
  start: (taskId?: string | null, type?: PomodoroType, duration?: number) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  complete: () => Promise<void>
  cancel: () => Promise<void>
  refresh: () => Promise<void>
  formatTime: (seconds: number) => string
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const [pomodoro, setPomodoro] = useState<Pomodoro | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const elapsedTimeRef = useRef<number>(0)
  const pomodoroRef = useRef<Pomodoro | null>(null)

  const { onTick, onComplete, onError } = options

  useEffect(() => {
    pomodoroRef.current = pomodoro
    if (pomodoro) {
      elapsedTimeRef.current = pomodoro.elapsedTime
    }
  }, [pomodoro])

  const remaining = pomodoro
    ? Math.max(0, pomodoro.duration - elapsedTimeRef.current)
    : 0

  const progress = pomodoro && pomodoro.duration > 0
    ? (elapsedTimeRef.current / pomodoro.duration) * 100
    : 0

  const isRunning = pomodoro?.status === PomodoroStatus.RUNNING
  const isPaused = pomodoro?.status === PomodoroStatus.PAUSED

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

  const start = useCallback(async (
    taskId?: string | null,
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

  const pause = useCallback(async () => {
    const current = pomodoroRef.current
    if (!current) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pause',
          id: current.id
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
  }, [onError])

  const resume = useCallback(async () => {
    const current = pomodoroRef.current
    if (!current) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resume',
          id: current.id
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
  }, [onError])

  const complete = useCallback(async () => {
    const current = pomodoroRef.current
    if (!current) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          id: current.id
        })
      })
      const result = await response.json()

      if (result.success) {
        setPomodoro(null)
        elapsedTimeRef.current = 0
        onComplete?.()
      } else {
        onError?.(result.error || '完成失败')
      }
    } catch (error) {
      onError?.('网络错误')
    } finally {
      setIsLoading(false)
    }
  }, [onError, onComplete])

  const cancel = useCallback(async () => {
    const current = pomodoroRef.current
    if (!current) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          id: current.id
        })
      })
      const result = await response.json()

      if (result.success) {
        setPomodoro(null)
        elapsedTimeRef.current = 0
      } else {
        onError?.(result.error || '取消失败')
      }
    } catch (error) {
      onError?.('网络错误')
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  useEffect(() => {
    const tick = async () => {
      const current = pomodoroRef.current
      if (!current || current.status !== PomodoroStatus.RUNNING) return

      const newElapsedTime = elapsedTimeRef.current + 1
      elapsedTimeRef.current = newElapsedTime

      setPomodoro(prev => prev ? { ...prev, elapsedTime: newElapsedTime } : null)
      onTick?.(newElapsedTime)

      if (newElapsedTime % 10 === 0 && current.id) {
        try {
          await fetch('/api/pomodoro', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update',
              id: current.id,
              status: PomodoroStatus.RUNNING,
              elapsedTime: newElapsedTime
            })
          })
        } catch {
          // Silent fail for sync
        }
      }

      if (newElapsedTime >= current.duration) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        await fetch('/api/pomodoro', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete',
            id: current.id
          })
        })
        setPomodoro(null)
        elapsedTimeRef.current = 0
        onComplete?.()
      }
    }

    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, onTick, onComplete])

  useEffect(() => {
    refresh()
  }, [refresh])

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
