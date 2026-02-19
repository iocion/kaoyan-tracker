'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DataItem {
  name: string
  value: number
  color: string
}

interface PieChartProps {
  data: DataItem[]
}

export function SubjectPieChart({ data }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        暂无数据
      </div>
    )
  }
  
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => {
            const hours = Math.floor(value)
            const mins = Math.round((value - hours) * 60)
            return [`${hours}小时${mins > 0 ? mins + '分' : ''}`, '时长']
          }}
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '12px',
            border: 'none',
            padding: '12px',
          }}
          itemStyle={{ color: '#fff' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
