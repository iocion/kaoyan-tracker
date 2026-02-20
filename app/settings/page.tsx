'use client'

import { useState, useEffect } from 'react'
import { Moon } from 'lucide-react'

interface Settings {
  focusDuration: number
  breakDuration: number
  soundEnabled: boolean
}

/**
 * 设置页面 - 精简版
 * 只保留已实现后端 API 的功能
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    focusDuration: 25,
    breakDuration: 5,
    soundEnabled: true
  })
  const [darkMode, setDarkMode] = useState(false)
  const [saving, setSaving] = useState(false)

  // 加载设置
  useEffect(() => {
    // 从后端加载设置
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings({
            focusDuration: data.data.focusDuration || 25,
            breakDuration: data.data.breakDuration || 5,
            soundEnabled: data.data.soundEnabled !== false
          })
        }
      })
      .catch(() => {
        // 使用默认设置
      })

    // 检查深色模式
    if (typeof window !== 'undefined') {
      setDarkMode(document.documentElement.classList.contains('dark'))
    }
  }, [])

  // 保存设置
  const saveSettings = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
    } catch (err) {
      console.error('保存失败:', err)
    } finally {
      setSaving(false)
    }
  }

  // 切换深色模式
  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    document.documentElement.classList.toggle('dark', newMode)
    localStorage.setItem('darkMode', String(newMode))
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">设置</h1>

      {/* 外观设置 */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium">深色模式</div>
              <div className="text-sm text-gray-500">切换应用主题</div>
            </div>
          </div>
          
          <button
            onClick={toggleDarkMode}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              darkMode ? 'bg-[#60a5fa]' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              darkMode ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>
      </div>

      {/* 番茄钟设置 */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <h2 className="font-medium mb-4">番茄钟时长</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">专注时长: {settings.focusDuration} 分钟</label>
            <input
              type="range"
              min="15"
              max="60"
              value={settings.focusDuration}
              onChange={(e) => {
                setSettings({ ...settings, focusDuration: parseInt(e.target.value) })
              }}
              onMouseUp={saveSettings}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">休息时长: {settings.breakDuration} 分钟</label>
            <input
              type="range"
              min="3"
              max="15"
              value={settings.breakDuration}
              onChange={(e) => {
                setSettings({ ...settings, breakDuration: parseInt(e.target.value) })
              }}
              onMouseUp={saveSettings}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 声音设置 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">声音提醒</div>
            <div className="text-sm text-gray-500">番茄钟结束时播放提示音</div>
          </div>
          
          <button
            onClick={() => {
              const newValue = !settings.soundEnabled
              setSettings({ ...settings, soundEnabled: newValue })
              fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...settings, soundEnabled: newValue })
              })
            }}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              settings.soundEnabled ? 'bg-[#60a5fa]' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              settings.soundEnabled ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>
      </div>

      {saving && <div className="text-center text-sm text-gray-500 mt-4">保存中...</div>}
    </div>
  )
}
