'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, RotateCcw, Clock, ChevronLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { formatTimeHHMMSS, getSubjectColor, getSubjectName } from '@/lib/utils'

type Subject = 'COMPUTER_408' | 'MATH' | 'ENGLISH' | 'POLITICS'

const subjects: { key: Subject; name: string; color: string }[] = [
  { key: 'COMPUTER_408', name: '计算机408', color: '#3B82F6' },
  { key: 'MATH', name: '数学', color: '#10B981' },
  { key: 'ENGLISH', name: '英语', color: '#F59E0B' },
  { key: 'POLITICS', name: '政治', color: '#EF4444' },
]

export default function TimerPage() {
  const [subject, setSubject] = useState<Subject>('COMPUTER_408')
  const [title, setTitle] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedTime * 1000
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  const startTimer = () => {
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const stopTimer = async () => {
    setIsRunning(false)

    await fetch('/api/timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'stop',
        subject,
        title,
        duration: elapsedTime,
      }),
    })

    setElapsedTime(0)
    setTitle('')
  }

  const resetTimer = () => {
    setIsRunning(false)
    setElapsedTime(0)
    setTitle('')
  }

  const currentSubject = subjects.find(s => s.key === subject)

  return (
    <div className="min-h-screen bg-apple-gray-50 pb-28">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-apple-gray-200">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center">
          <Link
            href="/"
            className="p-2.5 -ml-2 hover:bg-apple-gray-100 rounded-full transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6 text-apple-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold text-apple-gray-900 ml-3 tracking-tight">学习计时</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-28 pb-6 space-y-6">
        {/* 学科选择 */}
        <div className="card-apple-lg p-5">
          <p className="text-sm font-medium text-apple-gray-500 mb-4 tracking-wide">选择学科</p>

          <div className="grid grid-cols-2 gap-3">
            {subjects.map((s) => (
              <button
                key={s.key}
                onClick={() => !isRunning && setSubject(s.key)}
                disabled={isRunning}
                className={`p-5 rounded-apple transition-all duration-300 ${
                  subject === s.key
                    ? 'shadow-apple-glow ring-2'
                    : 'shadow-apple-sm bg-apple-gray-50 hover:bg-apple-gray-100'
                }`}
                style={{
                  backgroundColor: subject === s.key ? `${s.color}10` : undefined,
                  borderColor: subject === s.key ? s.color : undefined,
                  color: subject === s.key ? s.color : undefined,
                }}
              >
                <p className="font-semibold text-lg">{s.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 学习内容 */}
        <div className="card-apple-lg p-5">
          <p className="text-sm font-medium text-apple-gray-500 mb-4 tracking-wide">学习内容（可选）</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isRunning}
            placeholder="例如：数据结构 - 二叉树遍历"
            className="w-full px-5 py-4 bg-apple-gray-50 rounded-apple-sm border-0 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* 计时器 */}
        <div
          className="rounded-apple-xl p-10 text-center shadow-apple-lg"
          style={{ backgroundColor: `${currentSubject?.color}10` }}
        >
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${currentSubject?.color}20` }}
            >
              <Clock className="w-4 h-4" style={{ color: currentSubject?.color }} strokeWidth={2.5} />
            </div>
            <span className="font-medium text-apple-gray-700 tracking-wide" style={{ color: currentSubject?.color }}>
              {currentSubject?.name}
            </span>
          </div>

          <div
            className="text-7xl font-bold font-mono mb-10 tracking-tight"
            style={{ color: currentSubject?.color }}
          >
            {formatTimeHHMMSS(elapsedTime)}
          </div>

          <div className="flex justify-center gap-3">
            {!isRunning && elapsedTime === 0 && (
              <button
                onClick={startTimer}
                className="flex items-center gap-2.5 px-10 py-5 gradient-primary hover:opacity-90 text-white rounded-full font-semibold shadow-apple-lg hover:shadow-apple-glow transition-all duration-300"
              >
                <Play className="w-5 h-5 fill-current" strokeWidth={2.5} />
                开始
              </button>
            )}

            {isRunning && (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-2.5 px-10 py-5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold shadow-apple-lg hover:shadow-lg transition-all duration-300"
              >
                <Pause className="w-5 h-5 fill-current" strokeWidth={2.5} />
                暂停
              </button>
            )}

            {!isRunning && elapsedTime > 0 && (
              <>
                <button
                  onClick={stopTimer}
                  className="flex items-center gap-2.5 px-10 py-5 gradient-primary hover:opacity-90 text-white rounded-full font-semibold shadow-apple-lg hover:shadow-apple-glow transition-all duration-300"
                >
                  <Check className="w-5 h-5 fill-current" strokeWidth={2.5} />
                  完成
                </button>
                <button
                  onClick={startTimer}
                  className="flex items-center gap-2.5 px-8 py-5 bg-apple-gray-200 hover:bg-apple-gray-300 text-apple-gray-800 rounded-full font-semibold transition-all duration-300"
                >
                  <Play className="w-5 h-5" strokeWidth={2.5} />
                  继续
                </button>
              </>
            )}

            {(isRunning || elapsedTime > 0) && (
              <button
                onClick={resetTimer}
                className="flex items-center justify-center w-14 h-14 bg-white/50 hover:bg-white/80 rounded-full font-semibold transition-all duration-300 shadow-sm"
              >
                <RotateCcw className="w-5 h-5 text-apple-gray-600" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* 提示 */}
        <div className="bg-blue-50 rounded-apple-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-semibold text-sm">💡</span>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">
              建议使用番茄工作法：25分钟专注 + 5分钟休息
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
