import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services/task.service'
import { taskCreateSchema, taskDeleteSchema, taskSetActiveSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

/**
 * GET /api/tasks
 * 获取所有任务
 */
export async function GET() {
  try {
    const tasks = await TaskService.getAll()

    return NextResponse.json({
      success: true,
      data: tasks
    })
  } catch (error) {
    console.error('[API] Get tasks error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取任务失败'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tasks
 * 创建新任务
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 验证输入
    const validated = taskCreateSchema.parse(body)

    // 创建任务
    const task = await TaskService.create(validated)

    return NextResponse.json(
      {
        success: true,
        data: task
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[API] Create task error:', error)

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
        error: '创建任务失败'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tasks
 * 删除任务
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    await taskDeleteSchema.parseAsync(body)

    await TaskService.delete(body.id)

    return NextResponse.json({
      success: true,
      data: { message: '任务已删除' }
    })
  } catch (error: any) {
    console.error('[API] Delete task error:', error)

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
        error: '删除任务失败'
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/tasks
 * 更新任务状态
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === 'setActive') {
      await taskSetActiveSchema.parseAsync(body)
      const task = await TaskService.setActive(body.id)
      return NextResponse.json({ success: true, data: task })
    }

    if (action === 'toggle') {
      const { id, isCompleted } = body
      const task = await TaskService.update(id, { isCompleted })
      return NextResponse.json({ success: true, data: task })
    }

    if (action === 'updatePomodoroCount') {
      const { id } = body
      const task = await TaskService.getById(id)
      if (!task) {
        return NextResponse.json(
          { success: false, error: '任务不存在' },
          { status: 404 }
        )
      }
      const updatedTask = await TaskService.update(id, {
        completedPomodoros: task.completedPomodoros + 1
      } as any)
      return NextResponse.json({ success: true, data: updatedTask })
    }

    return NextResponse.json(
      {
        success: false,
        error: '无效的操作类型'
      },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('[API] Update task error:', error)

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
        error: '更新任务失败'
      },
      { status: 500 }
    )
  }
}
