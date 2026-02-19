'use client'

import { useStats } from '@/lib/hooks/useStats'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Subject, SUBJECT_CONFIG } from '@/types'

const COLORS = {
  [Subject.COMPUTER_408]: '#3B82F6',
  [Subject.MATH]: '#10B981',
  [Subject.ENGLISH]: '#F59E0B',
  [Subject.POLITICS]: '#EF4444'
}

export default function RecordsPage() {
  const {
    summary,
    pieData,
    lineData,
    todayStats,
    subjectRanking,
    isLoading,
    changePeriod
  } = useStats({ period: 'week' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📊 学习统计
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            追踪进度，量化成长
          </p>
        </div>

        {/* 时间周期选择 */}
        <div className="flex justify-center gap-4 mb-8">
          {(['today', 'week', 'month'] as const).map(period => (
            <button
              key={period}
              onClick={() => changePeriod(period)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                summary?.period === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {period === 'today' && '今日'}
              {period === 'week' && '本周'}
              {period === 'month' && '本月'}
            </button>
          ))}
        </div>

        {/* 统计卡片 */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="总番茄数"
              value={summary.totalPomodoros}
              unit="个"
              color="blue"
            />
            <StatCard
              title="总时长"
              value={summary.totalHours.toFixed(1)}
              unit="小时"
              color="purple"
            />
            <StatCard
              title="完成任务"
              value={summary.tasks.completed}
              unit="个"
              color="green"
            />
            <StatCard
              title="创建任务"
              value={summary.tasks.created}
              unit="个"
              color="orange"
            />
          </div>
        )}

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 学科分布 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              📈 学科分布
            </h2>
            <div className="h-80">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  暂无数据
                </div>
              )}
            </div>
          </div>

          {/* 每日趋势 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              📅 每日趋势
            </h2>
            <div className="h-80">
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  暂无数据
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 学科排名 */}
        {subjectRanking.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              🏆 学科排名
            </h2>
            <div className="space-y-4">
              {subjectRanking.map((item, index) => {
                const subjectKey = item.subject as Subject
                const config = SUBJECT_CONFIG[subjectKey]
                const color = COLORS[subjectKey]

                return (
                  <div
                    key={subjectKey}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white text-lg"
                         style={{ backgroundColor: color }}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">
                        {config.name}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{item.pomodoros} 个番茄</span>
                        <span>{item.hours.toFixed(1)} 小时</span>
                      </div>
                    </div>
                    <div className="text-2xl">{config.icon}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 今日统计 */}
        {todayStats && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              📌 今日概览
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {todayStats.totalPomodoros}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">番茄数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {todayStats.totalHours.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">学习时长</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {todayStats.tasks.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">完成任务</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {todayStats.tasks.created}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">创建任务</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 统计卡片组件
interface StatCardProps {
  title: string
  value: number | string
  unit?: string
  color: 'blue' | 'purple' | 'green' | 'orange'
}

function StatCard({ title, value, unit, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
  }

  const textColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400'
  }

  return (
    <div className={`p-6 rounded-2xl border-2 ${colorClasses[color]}`}>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        {title}
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </div>
    </div>
  )
}
