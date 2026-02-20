import Link from 'next/link'
import { Clock, BarChart3, List, Plus, Settings, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 状态栏 */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              🍅
            </span>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* 开始学习 */}
        <Link
          href="/timer"
          className="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                开始专注
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                25分钟专注 · 自动休息提醒
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-blue-500" />
          </div>
        </Link>

        {/* 学习统计 */}
        <Link
          href="/records"
          className="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                学习统计
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                今日数据 · 学科分析
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-indigo-500" />
          </div>
        </Link>

        {/* 任务管理 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <List className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                任务管理
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                4个待办任务 · 进度追踪
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-green-500" />
          </div>
        </div>

        {/* 个性化设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                个性化
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                自定义时长 · 声音提醒
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-purple-500" />
          </div>
        </div>

        {/* 快速添加任务 */}
        <div className="bg-blue-500 dark:bg-blue-600 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-center gap-3">
            <Plus className="w-8 h-8 text-white" />
            <span className="text-white font-semibold text-lg">
              添加任务
            </span>
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="px-4 py-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            今天已完成 <span className="text-blue-600 dark:text-blue-400 font-semibold">0</span> 个番茄
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            保持专注，成就未来 🚀
          </p>
        </div>
      </div>

      {/* 底部导航栏 */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex justify-around items-center">
            <Link
              href="/timer"
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                false ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
            >
              <Clock className={`w-6 h-6 ${false ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${false ? 'text-blue-900 dark:text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
                计时
              </span>
            </Link>

            <Link
              href="/records"
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                false ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
            >
              <BarChart3 className={`w-6 h-6 ${false ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${false ? 'text-blue-900 dark:text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
                统计
              </span>
            </Link>

            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
