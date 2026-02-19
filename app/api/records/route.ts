import { NextRequest, NextResponse } from 'next/server'
import { RecordService } from '@/lib/services/record.service'
import { recordCreateSchema, recordQuerySchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

/**
 * GET /api/records
 * 获取学习记录
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // 验证查询参数
    const validated = recordQuerySchema.parse({
      limit: parseInt(searchParams.get('limit') || '50'),
      subject: searchParams.get('subject') || undefined
    })

    let records

    if (validated.subject) {
      records = await RecordService.getBySubject(validated.subject, validated.limit)
    } else {
      records = await RecordService.getAll(validated.limit)
    }

    return NextResponse.json({
      success: true,
      data: records
    })
  } catch (error: any) {
    console.error('[API] Get records error:', error)

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
        error: '获取记录失败'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/records
 * 创建学习记录
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 验证输入
    const validated = recordCreateSchema.parse(body)

    // 创建记录
    const record = await RecordService.create(validated)

    return NextResponse.json(
      {
        success: true,
        data: record
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[API] Create record error:', error)

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
        error: '创建记录失败'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/records
 * 删除学习记录
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少记录 ID'
        },
        { status: 400 }
      )
    }

    await RecordService.delete(id)

    return NextResponse.json({
      success: true,
      data: { message: '记录已删除' }
    })
  } catch (error) {
    console.error('[API] Delete record error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '删除记录失败'
      },
      { status: 500 }
    )
  }
}
