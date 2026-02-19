'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Plus, Clock } from 'lucide-react'
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
    <div className="min-h-screen bg-apple-gray-50 pb-24">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-10 border-b border-apple-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-apple-gray-900 ml-2">学习记录</h1>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 添加记录表单 */}
        {showForm && (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">添加学习记录</h3>
            
            <form onSubmit={submitRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">学科</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-apple-gray-50 rounded-xl border-0"
                >
                  {subjects.map((s) => (
                    <option key={s.key} value={s.key}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">时长（小时）</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="例如：2.5"
                  className="w-full px-4 py-3 bg-apple-gray-50 rounded-xl border-0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">备注（可选）</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="学习内容..."
                  className="w-full px-4 py-3 bg-apple-gray-50 rounded-xl border-0"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-apple-gray-200 hover:bg-apple-gray-300 rounded-xl font-medium"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* 记录列表 */}
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无学习记录</p>
              <p className="text-sm text-gray-400 mt-1">点击右上角 + 添加记录</p>
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: getSubjectColor(record.subject) }}
                    >
                      {getSubjectName(record.subject)[0]}
                    </div>
                    
                    <div>
                      <p className="font-medium">{getSubjectName(record.subject)}</p>
                      {record.notes && (
                        <p className="text-sm text-gray-500">{record.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: getSubjectColor(record.subject) }}>
                      {formatHours(record.duration)}
                    </p>
                    <p className="text-xs text-gray-400">
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
