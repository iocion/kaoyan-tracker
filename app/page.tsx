import Link from 'next/link'
import { Clock, BarChart3, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">🍅</div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            考研番茄钟
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            专注当下，成就未来。用科学的番茄工作法，高效管理考研学习时间。
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/timer"
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <Clock className="w-5 h-5" />
              开始学习
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/records"
              className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <BarChart3 className="w-5 h-5" />
              查看统计
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <FeatureCard
            icon="⏱️"
            title="番茄计时"
            description="25分钟专注 + 5分钟休息，科学管理学习节奏"
          />
          <FeatureCard
            icon="📋"
            title="任务管理"
            description="创建考研任务，追踪进度，一目了然"
          />
          <FeatureCard
            icon="📊"
            title="学习统计"
            description="可视化学习数据，量化你的进步"
          />
        </div>

        {/* Stats Preview */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            为什么选择番茄工作法？
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">
                🎯
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  提高专注力
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  短时间高强度专注，避免疲劳，保持学习效率
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  减少拖延
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  将大任务拆解为小番茄，降低心理压力
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-2xl">
                📈
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  可视化进步
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  统计学习数据，追踪每日进步，激励自己
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-2xl">
                🔄
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  形成习惯
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  持续使用番茄工作法，培养良好的学习习惯
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-block p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl text-white">
            <h2 className="text-3xl font-bold mb-4">
              准备开始高效学习了吗？
            </h2>
            <p className="text-blue-100 mb-6 text-lg">
              只需一个番茄钟，开启考研成功之路
            </p>
            <Link
              href="/timer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 hover:bg-gray-50 rounded-xl font-semibold text-lg transition-colors"
            >
              立即开始
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// 功能卡片组件
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  )
}
