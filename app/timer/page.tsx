'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, RotateCcw, Clock, ChevronLeft } from 'lucide-react'
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
    
    // 保存到后端
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
    
    // 重置
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
    <div className="min-h-screen bg-apple-gray-50 pb-24">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-10 border-b border-apple-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-apple-gray-900 ml-2">学习计时</h1>
        </div>
      </div>
      
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 学科选择 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-3">选择学科</p>
          
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((s) => (
              <button
                key={s.key}
                onClick={() => !isRunning && setSubject(s.key)}
                disabled={isRunning}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  subject === s.key
                    ? 'border-current'
                    : 'border-transparent bg-apple-gray-50'
                }`}
                style={{
                  borderColor: subject === s.key ? s.color : undefined,
                  backgroundColor: subject === s.key ? `${s.color}15` : undefined,
                }}
              >
                <p 
                  className="font-semibold"
                  style={{ color: s.color }}
                >
                  {s.name}
                </p>
              </button>
            ))}
          </div>
        </div>
        
        {/* 学习内容 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-3">学习内容（可选）</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isRunning}
            placeholder="例如：数据结构 - 二叉树遍历"
            className="w-full px-4 py-3 bg-apple-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          />
        </div>
        
        {/* 计时器 */}
        <div 
          className="rounded-3xl p-8 text-center shadow-lg"
          style={{ backgroundColor: `${currentSubject?.color}15` }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-5 h-5" style={{ color: currentSubject?.color }} />
            <span className="font-medium" style={{ color: currentSubject?.color }}>
              {currentSubject?.name}
            </span>
          </div>
          
          <div 
            className="text-6xl font-bold font-mono mb-8 tracking-wider"
            style={{ color: currentSubject?.color }}
          >
            {formatTimeHHMMSS(elapsedTime)}
          </div>
          
          <div className="flex justify-center gap-3">
            {!isRunning && elapsedTime === 0 && (
              <button
                onClick={startTimer}
                className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium shadow-lg transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                开始
              </button>
            )}
            
            {isRunning && (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-medium shadow-lg transition-all"
              >
                <Pause className="w-5 h-5 fill-current" />
                暂停
              </button>
            )}
            
            {!isRunning && elapsedTime > 0 && (
              <>
                <button
                  onClick={stopTimer}
                  className="flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-medium shadow-lg transition-all"
                >
                  <Square className="w-5 h-5 fill-current" />
                  完成
                </button>
                <button
                  onClick={startTimer}
                  className="flex items-center gap-2 px-6 py-4 bg-apple-gray-200 hover:bg-apple-gray-300 rounded-full font-medium transition-all"
                >
                  <Play className="w-5 h-5" />
                  继续
                </button>
              </>
            )}
            
            {(isRunning || elapsedTime > 0) && (
              <button
                onClick={resetTimer}
                className="flex items-center gap-2 px-4 py-4 bg-white/50 hover:bg-white/80 rounded-full font-medium transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* 提示 */}
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-sm text-blue-700">
            💡 建议使用番茄工作法：25分钟专注 + 5分钟休息
          </p>
        </div>
      </div>
    </div>
  )
}
