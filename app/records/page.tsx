'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Plus, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { getSubjectColor, getSubjectName, formatHours } from '@/lib/utils'

interface Record {
  id: string
  subject: string
  duration: number
  notes: string | null
  createdAt: string
}

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('COMPUTER_408')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records')
      if (res.ok) {
        const data = await res.json()
        setRecords(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const submitRecord = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!duration) return

    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        duration: parseFloat(duration),
        notes,
      }),
    })

    setDuration('')
    setNotes('')
    setShowForm(false)
    fetchRecords()
  }

  const subjects = [
    { key: 'COMPUTER_408', name: '计算机408', color: '#3B82F6' },
    { key: 'MATH', name: '数学', color: '#10B981' },
    { key: 'ENGLISH', name: '英语', color: '#F59E0B' },
    { key: 'POLITICS', name: '政治', color: '#EF4444' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-apple-gray-50 pb-28">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-apple-gray-200">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="p-2.5 -ml-2 hover:bg-apple-gray-100 rounded-full transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-apple-gray-600" />
            </Link>
            <h1 className="text-xl font-semibold text-apple-gray-900 ml-3 tracking-tight">学习记录</h1>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="p-2.5 gradient-primary hover:opacity-90 text-white rounded-full shadow-apple-sm transition-all duration-300"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-28 pb-6 space-y-5">
        {/* 添加记录表单 */}
        {showForm && (
          <div className="card-apple-lg p-6 animate-in slide-in-from-top-4 duration-300">
            <h3 className="font-semibold text-lg mb-5 tracking-tight text-apple-gray-900">添加学习记录</h3>

            <form onSubmit={submitRecord} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-apple-gray-500 mb-3 tracking-wide">学科</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-5 py-4 bg-apple-gray-50 rounded-apple-sm border-0 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 text-apple-gray-900 font-medium"
                >
                  {subjects.map((s) => (
                    <option key={s.key} value={s.key}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-gray-500 mb-3 tracking-wide">时长（小时）</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="例如：2.5"
                  className="w-full px-5 py-4 bg-apple-gray-50 rounded-apple-sm border-0 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-gray-500 mb-3 tracking-wide">备注（可选）</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="学习内容..."
                  className="w-full px-5 py-4 bg-apple-gray-50 rounded-apple-sm border-0 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-4 gradient-primary hover:opacity-90 text-white rounded-apple-sm font-semibold shadow-apple-sm transition-all duration-300"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 bg-apple-gray-200 hover:bg-apple-gray-300 text-apple-gray-800 rounded-apple-sm font-semibold transition-all duration-300"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 记录列表 */}
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-apple-gray-100 mb-5">
                <Clock className="w-10 h-10 text-apple-gray-300" strokeWidth={1.5} />
              </div>
              <p className="text-apple-gray-500 font-semibold mb-2">暂无学习记录</p>
              <p className="text-sm text-apple-gray-400">点击右上角 + 添加记录</p>
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="card-apple p-5 hover:shadow-apple-sm transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: getSubjectColor(record.subject) }}
                    >
                      {getSubjectName(record.subject)[0]}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-apple-gray-900 text-base truncate">{getSubjectName(record.subject)}</p>
                      {record.notes && (
                        <p className="text-sm text-apple-gray-500 truncate mt-0.5">{record.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="text-2xl font-bold tracking-tight" style={{ color: getSubjectColor(record.subject) }}>
                      {formatHours(record.duration)}
                    </p>
                    <p className="text-xs text-apple-gray-400 mt-1">
                      {format(new Date(record.createdAt), 'MM-dd HH:mm', { locale: zhCN })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
