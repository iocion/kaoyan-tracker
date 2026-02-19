import { prisma } from '@/lib/prisma'
import { UserSettings, SettingsUpdateInput } from '@/types'

/**
 * 设置服务
 * 封装所有用户设置相关的业务逻辑
 */
export class SettingsService {
  private static readonly DEFAULT_USER_ID = 'default'
  private static readonly DEFAULT_SETTINGS = {
    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    autoStartBreak: false,
    autoStartFocus: false,
    soundEnabled: true,
    vibrationEnabled: true
  }

  /**
   * 获取用户设置
   */
  static async get(): Promise<UserSettings> {
    try {
      let settings = await prisma.userSettings.findUnique({
        where: { userId: this.DEFAULT_USER_ID }
      })

      // 如果不存在，创建默认设置
      if (!settings) {
        settings = await this.createDefault()
      }

      return settings as UserSettings
    } catch (error) {
      console.error('[SettingsService] Get error:', error)
      throw new Error('获取设置失败')
    }
  }

  /**
   * 更新用户设置
   */
  static async update(input: SettingsUpdateInput): Promise<UserSettings> {
    try {
      const settings = await prisma.userSettings.upsert({
        where: { userId: this.DEFAULT_USER_ID },
        update: input,
        create: {
          userId: this.DEFAULT_USER_ID,
          ...this.DEFAULT_SETTINGS,
          ...input
        }
      })

      return settings as UserSettings
    } catch (error) {
      console.error('[SettingsService] Update error:', error)
      throw new Error('更新设置失败')
    }
  }

  /**
   * 重置为默认设置
   */
  static async reset(): Promise<UserSettings> {
    try {
      const settings = await prisma.userSettings.upsert({
        where: { userId: this.DEFAULT_USER_ID },
        update: this.DEFAULT_SETTINGS,
        create: {
          userId: this.DEFAULT_USER_ID,
          ...this.DEFAULT_SETTINGS
        }
      })

      return settings as UserSettings
    } catch (error) {
      console.error('[SettingsService] Reset error:', error)
      throw new Error('重置设置失败')
    }
  }

  /**
   * 创建默认设置
   */
  private static async createDefault(): Promise<UserSettings> {
    const settings = await prisma.userSettings.create({
      data: {
        userId: this.DEFAULT_USER_ID,
        ...this.DEFAULT_SETTINGS
      }
    })

    return settings as UserSettings
  }

  /**
   * 获取设置值（带缓存）
   */
  private static cache: UserSettings | null = null

  static async getCached(): Promise<UserSettings> {
    if (this.cache) {
      return this.cache
    }

    this.cache = await this.get()
    return this.cache
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.cache = null
  }

  /**
   * 批量更新设置
   */
  static async batchUpdate(updates: SettingsUpdateInput): Promise<UserSettings> {
    // 更新设置
    const settings = await this.update(updates)

    // 清除缓存
    this.clearCache()

    return settings
  }
}
