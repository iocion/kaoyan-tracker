import { NextRequest, NextResponse } from 'next/server'
import { SettingsService } from '@/lib/services/settings.service'
import { settingsUpdateSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

/**
 * GET /api/settings
 * 获取用户设置
 */
export async function GET() {
  try {
    const settings = await SettingsService.get()

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('[API] Get settings error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取设置失败'
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/settings
 * 更新用户设置
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()

    // 验证输入
    const validated = settingsUpdateSchema.parse(body)

    // 更新设置
    const settings = await SettingsService.batchUpdate(validated)

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error: any) {
    console.error('[API] Update settings error:', error)

    // Zod 验证错误
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: '参数验证失败',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: '更新设置失败'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/settings/reset
 * 重置为默认设置
 */
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json()

    if (action === 'reset') {
      const settings = await SettingsService.reset()

      return NextResponse.json({
        success: true,
        data: settings
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: '无效的操作类型'
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API] Reset settings error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '重置设置失败'
      },
      { status: 500 }
    )
  }
}
