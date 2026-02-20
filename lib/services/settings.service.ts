import { prisma } from '@/lib/prisma'
import { UserSettings, SettingsUpdateInput } from '@/types'
import { DEFAULT_USER_ID, DEFAULT_SETTINGS } from '@/lib/constants'

export class SettingsService {
  private static cache: UserSettings | null = null

  static async get(): Promise<UserSettings> {
    try {
      let settings = await prisma.userSettings.findUnique({
        where: { userId: DEFAULT_USER_ID }
      })

      if (!settings) {
        settings = await this.createDefault()
      }

      return settings as UserSettings
    } catch (error) {
      console.error('[SettingsService] Get error:', error)
      throw new Error('获取设置失败')
    }
  }

  static async update(input: SettingsUpdateInput): Promise<UserSettings> {
    try {
      const settings = await prisma.userSettings.upsert({
        where: { userId: DEFAULT_USER_ID },
        update: input,
        create: {
          userId: DEFAULT_USER_ID,
          ...DEFAULT_SETTINGS,
          ...input
        }
      })

      return settings as UserSettings
    } catch (error) {
      console.error('[SettingsService] Update error:', error)
      throw new Error('更新设置失败')
    }
  }

  static async reset(): Promise<UserSettings> {
    try {
      const settings = await prisma.userSettings.upsert({
        where: { userId: DEFAULT_USER_ID },
        update: DEFAULT_SETTINGS,
        create: {
          userId: DEFAULT_USER_ID,
          ...DEFAULT_SETTINGS
        }
      })

      return settings as UserSettings
    } catch (error) {
      console.error('[SettingsService] Reset error:', error)
      throw new Error('重置设置失败')
    }
  }

  private static async createDefault(): Promise<UserSettings> {
    const settings = await prisma.userSettings.create({
      data: {
        userId: DEFAULT_USER_ID,
        ...DEFAULT_SETTINGS
      }
    })

    return settings as UserSettings
  }

  static async getCached(): Promise<UserSettings> {
    if (this.cache) {
      return this.cache
    }

    this.cache = await this.get()
    return this.cache
  }

  static clearCache(): void {
    this.cache = null
  }

  static async batchUpdate(updates: SettingsUpdateInput): Promise<UserSettings> {
    const settings = await this.update(updates)
    this.clearCache()
    return settings
  }
}
