import { useState, useEffect, useCallback } from 'react'
import { UserSettings, SettingsUpdateInput } from '@/types'

interface UseSettingsReturn {
  settings: UserSettings | null
  isLoading: boolean

  // 操作
  updateSettings: (input: SettingsUpdateInput) => Promise<void>
  resetSettings: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * 设置管理 Hook
 * 管理用户设置
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 刷新设置
  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings')
      const result = await response.json()

      if (result.success) {
        setSettings(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 更新设置
  const updateSettings = useCallback(async (input: SettingsUpdateInput) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      const result = await response.json()

      if (result.success) {
        setSettings(result.data)
      } else {
        throw new Error(result.error || '更新设置失败')
      }
    } catch (error: any) {
      console.error('Failed to update settings:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 重置设置
  const resetSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      })
      const result = await response.json()

      if (result.success) {
        setSettings(result.data)
      } else {
        throw new Error(result.error || '重置设置失败')
      }
    } catch (error: any) {
      console.error('Failed to reset settings:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
    refresh
  }
}
