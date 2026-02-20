'use client'

import { useState, useEffect } from 'react'

interface Record {
  id: string
  subject: string
  duration: number
  createdAt: string
}

/**
 * 统计页面 - 精简版
 * 只显示已实现后端 API 的数据
 */
export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/records')
      .then(r => r.json())
      .then(data => {
        if (data.success) setRecords(data.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-12 text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">学习记录</h1>

      {records.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
          暂无记录，开始番茄钟学习吧
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{record.subject}</div>
                  <div className="text-sm text-gray-500">{formatDate(record.createdAt)}</div>
                </div>
                <div className="text-lg font-bold text-[#60a5fa]">
                  {record.duration}h
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
