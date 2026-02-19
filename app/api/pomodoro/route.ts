import { NextRequest, NextResponse } from 'next/server'
import { PomodoroService } from '@/lib/services/pomodoro.service'
import {
  pomodoroCreateSchema,
  pomodoroUpdateSchema,
  pomodoroPauseSchema,
  pomodoroResumeSchema,
  pomodoroCompleteSchema,
  pomodoroCancelSchema
} from '@/lib/validators'

export const dynamic = 'force-dynamic'

/**
 * GET /api/pomodoro
 * 获取当前正在进行的番茄钟
 */
export async function GET() {
  try {
    const activePomodoro = await PomodoroService.getActive()

    return NextResponse.json({
      success: true,
      data: activePomodoro
    })
  } catch (error) {
    console.error('[API] Get pomodoro error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取番茄钟失败'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pomodoro
 * 开始新的番茄钟
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 验证输入
    const validated = pomodoroCreateSchema.parse(body)

    // 开始番茄钟
    const pomodoro = await PomodoroService.start(validated)

    return NextResponse.json(
      {
        success: true,
        data: pomodoro
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[API] Start pomodoro error:', error)

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
        error: '开始番茄钟失败'
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/pomodoro
 * 更新番茄钟状态
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    // 根据不同的操作进行验证和处理
    switch (action) {
      case 'pause':
        await pomodoroPauseSchema.parseAsync(body)
        const paused = await PomodoroService.pause(body.id)
        return NextResponse.json({ success: true, data: paused })

      case 'resume':
        await pomodoroResumeSchema.parseAsync(body)
        const resumed = await PomodoroService.resume(body.id)
        return NextResponse.json({ success: true, data: resumed })

      case 'complete':
        await pomodoroCompleteSchema.parseAsync(body)
        const completed = await PomodoroService.complete(body.id)
        return NextResponse.json({ success: true, data: completed })

      case 'cancel':
        await pomodoroCancelSchema.parseAsync(body)
        const cancelled = await PomodoroService.cancel(body.id)
        return NextResponse.json({ success: true, data: cancelled })

      case 'update':
        await pomodoroUpdateSchema.parseAsync(body)
        const updated = await PomodoroService.update(body.id, {
          status: body.status,
          elapsedTime: body.elapsedTime
        })
        return NextResponse.json({ success: true, data: updated })

      default:
        return NextResponse.json(
          {
            success: false,
            error: '无效的操作类型'
          },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('[API] Update pomodoro error:', error)

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
        error: '更新番茄钟失败'
      },
      { status: 500 }
    )
  }
}
