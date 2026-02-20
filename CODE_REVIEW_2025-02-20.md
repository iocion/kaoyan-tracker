## 📅 代码审查报告 - 2025-02-20

### 📊 审查统计
- 审查文件数：2
- 发现问题数：8
- 修复问题数：0
- 重构建议数：3

### 🔴 高优先级问题

#### 问题 1：缺少用户认证
**严重程度：** 🔴 高
**类型：** 安全
**位置：** `app/api/pomodoro/route.ts` (第 7 行)

**当前代码：**
```typescript
const activePomodoro = await PomodoroService.getActive()
```

**问题说明：**
API 路由没有进行用户身份验证，所有请求都使用 `DEFAULT_USER_ID` 硬编码。这存在严重安全隐患。

**建议修复：**
```typescript
// 1. 添加认证中间件
import { getServerSession } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: '未授权' },
      { status: 401 }
    )
  }

  const userId = session.user.id
  const activePomodoro = await PomodoroService.getActive(userId)
  // ...
}

// 2. 修改服务方法接受 userId
static async getActive(userId: string): Promise<Pomodoro | null> {
  const activePomodoro = await prisma.pomodoro.findFirst({
    where: {
      userId,  // 使用实际 userId 而非硬编码
      status: { in: [PomodoroStatus.RUNNING, PomodoroStatus.PAUSED] }
    }
  })
  return activePomodoro
}
```

**影响范围：** 所有 API 端点

---

#### 问题 2：Zod 验证错误处理不完整
**严重程度：** 🔴 高
**类型：** 错误处理
**位置：** `app/api/pomodoro/route.ts` (第 29-38 行)

**当前代码：**
```typescript
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
```

**问题说明：**
1. `error.name` 检查不可靠，ZodError 类型可能在不同版本中变化
2. 没有使用 `instanceof` 类型守卫
3. `error.errors` 访问不安全

**建议修复：**
```typescript
import { ZodError } from 'zod'

catch (error: unknown) {
  console.error('[API] Start pomodoro error:', error)

  // 使用类型守卫
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: '参数验证失败',
        details: error.errors  // ZodError.errors 是安全的
      },
      { status: 400 }
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: '开始番茄钟失败',
      details: error instanceof Error ? error.message : '未知错误'
    },
    { status: 500 }
  )
}
```

**影响范围：** 所有使用 Zod 验证的 API

---

#### 问题 3：计时器状态在页面刷新后会丢失
**严重程度：** 🔴 高
**类型：** 功能 Bug
**位置：** `components/timer/timer-display.tsx` (需要创建）

**问题说明：**
番茄钟状态完全存储在前端 React 状态中，页面刷新后会全部丢失。没有本地存储持久化。

**建议修复：**
```typescript
// 1. 使用 localStorage 持久化
import { useEffect } from 'react'

useEffect(() => {
  // 保存状态到 localStorage
  if (timer.isRunning || timer.elapsedTime > 0) {
    localStorage.setItem('pomodoroState', JSON.stringify(timer))
  }
}, [timer])

useEffect(() => {
  // 页面加载时恢复状态
  const saved = localStorage.getItem('pomodoroState')
  if (saved) {
    try {
      const state = JSON.parse(saved)
      setTimer(state)
    } catch (e) {
      console.error('Failed to restore timer state:', e)
    }
  }
}, [])

// 2. 或使用 Server-Sent Events/WebSocket 实时同步
// 前端连接到后端获取实时状态
const eventSource = new EventSource('/api/timer/events')
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  setTimer(data.pomodoro)
}
```

**影响范围：** 用户体验，数据丢失

---

#### 问题 4：并发番茄钟问题未解决
**严重程度：** 🔴 高
**类型：** 业务逻辑 Bug
**位置：** `lib/services/pomodoro.service.ts` (第 46-52 行)

**当前代码：**
```typescript
static async start(input: PomodoroCreateInput): Promise<Pomodoro> {
  // 先结束任何正在进行的番茄钟
  await this.cancelAllActive()

  // 创建新的番茄钟
  const pomodoro = await prisma.pomodoro.create({...})
  return pomodoro
}
```

**问题说明：**
虽然有 `cancelAllActive()`，但在以下场景仍可能出现并发问题：

1. 用户快速点击两次"开始"按钮
2. 两个请求几乎同时到达服务器
3. 两个 `cancelAllActive()` 都查询到之前的活跃番茄钟
4. 两个请求都创建了新番茄钟
5. 结果：两个番茄钟同时运行

**建议修复：**
```typescript
// 使用数据库事务 + 独占锁
static async start(input: PomodoroCreateInput): Promise<Pomodoro> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 使用 SELECT FOR UPDATE 锁定用户记录
      await tx.$executeRaw`
        SELECT id FROM "User" WHERE id = ${DEFAULT_USER_ID} FOR UPDATE
      `

      // 2. 取消所有活跃番茄钟
      await tx.pomodoro.updateMany({
        where: {
          userId: DEFAULT_USER_ID,
          status: { in: [PomodoroStatus.RUNNING, PomodoroStatus.PAUSED] }
        },
        data: {
          status: PomodoroStatus.CANCELLED,
          endedAt: new Date()
        }
      })

      // 3. 创建新番茄钟
      const pomodoro = await tx.pomodoro.create({
        data: {
          userId: DEFAULT_USER_ID,
          taskId: input.taskId,
          type: input.type,
          status: PomodoroStatus.RUNNING,
          duration: input.duration * 60,
          elapsedTime: 0
        }
      })

      return pomodoro
    })

    return result as Pomodoro
  } catch (error) {
    console.error('[PomodoroService] Start error:', error)
    throw new Error('开始番茄钟失败')
  }
}
```

**影响范围：** 数据一致性，用户体验

---

#### 问题 5：事务中存在 N+1 查询
**严重程度：** 🟡 中
**类型：** 性能
**位置：** `lib/services/pomodoro.service.ts` (第 115-134 行)

**当前代码：**
```typescript
static async complete(id: string): Promise<Pomodoro> {
  const result = await prisma.$transaction(async (tx) => {
    const pomodoro = await tx.pomodoro.update({...})

    const today = startOfDay(new Date())
    const userId = pomodoro.userId

    let subjectField: string | null = null
    if (pomodoro.taskId) {
      // N+1 查询：在事务中查询任务
      const task = await tx.task.findUnique({
        where: { id: pomodoro.taskId },
        select: { subject: true }
      })
      if (task) {
        subjectField = SUBJECT_FIELD_MAP[task.subject] || null
      }
    }

    // 更新任务进度
    if (pomodoro.type === PomodoroType.FOCUS && pomodoro.taskId) {
      const task = await tx.task.findUnique({
        where: { id: pomodoro.taskId },
        select: { estimatedPomodoros: true, completedPomodoros: true }
      })
      // ...
    }
  })
}
```

**问题说明：**
在同一个事务中，如果番茄钟有关联任务，需要多次查询任务表。虽然 Prisma 优化了一些，但仍可以改进。

**建议修复：**
```typescript
// 一次性包含任务数据
static async complete(id: string): Promise<Pomodoro> {
  const result = await prisma.$transaction(async (tx) => {
    const pomodoro = await tx.pomodoro.update({
      where: { id },
      data: { status: PomodoroStatus.COMPLETED, endedAt: new Date() },
      include: { task: true }  // 一次性查询任务
    })

    const today = startOfDay(new Date())
    const userId = pomodoro.userId

    let subjectField: string | null = null
    if (pomodoro.task) {  // 直接使用已经查询的任务数据
      subjectField = SUBJECT_FIELD_MAP[pomodoro.task.subject] || null
    }

    // 更新任务进度 - 无需再次查询
    if (pomodoro.type === PomodoroType.FOCUS && pomodoro.task) {
      const newCompleted = pomodoro.task.completedPomodoros + 1
      const shouldComplete = newCompleted >= pomodoro.task.estimatedPomodoros

      await tx.task.update({
        where: { id: pomodoro.task.id },
        data: {
          completedPomodoros: { increment: 1 },
          isCompleted: shouldComplete,
          ...(shouldComplete && { completedAt: new Date() })
        }
      })
    }

    // 其余逻辑...
  })
}
```

**影响范围：** 性能优化

---

### 🟡 中优先级问题

#### 问题 6：错误日志格式不统一
**严重程度：** 🟡 中
**类型：** 代码质量
**位置：** 多个文件

**当前代码：**
```typescript
// route.ts
console.error('[API] Get pomodoro error:', error)

// pomodoro.service.ts
console.error('[PomodoroService] Get active error:', error)
```

**问题说明：**
错误日志前缀不统一，不利于日志聚合和分析。

**建议修复：**
```typescript
// lib/logger.ts
export class Logger {
  static error(context: string, message: string, error: unknown) {
    console.error(`[${context}] ${message}:`, error)
  }

  static info(context: string, message: string, data?: any) {
    console.info(`[${context}] ${message}:`, data)
  }
}

// 使用
Logger.error('API', 'Get pomodoro error', error)
Logger.info('API', 'Request received', { userId, action })
```

**影响范围：** 可维护性

---

#### 问题 7：缺少请求参数验证
**严重程度：** 🟡 中
**类型：** 安全
**位置：** `app/api/pomodoro/route.ts` (PATCH 方法)

**当前代码：**
```typescript
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'pause':
        await pomodoroPauseSchema.parseAsync(body)
        // ...
```

**问题说明：**
虽然使用了 `pomodoroPauseSchema.parseAsync()`，但在 `switch` 语句之前没有先验证 `action` 字段本身。如果 `action` 缺失或为无效值，会在验证之前执行 switch。

**建议修复：**
```typescript
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()

    // 先验证 action 字段
    const actionSchema = z.object({
      action: z.enum(['pause', 'resume', 'complete', 'cancel', 'update'])
    })
    const { action } = actionSchema.parse(body)

    switch (action) {
      case 'pause':
        await pomodoroPauseSchema.parseAsync(body)
        // ...
```

**影响范围：** 输入验证

---

### 🟢 低优先级问题

#### 问题 8：Magic Number 硬编码
**严重程度：** 🟢 低
**类型：** 代码质量
**位置：** `lib/services/pomodoro.service.ts`

**当前代码：**
```typescript
duration: input.duration * 60,  // 硬编码的转换因子
```

**问题说明：**
60 是分钟转秒的转换因子，但作为 Magic Number 硬编码在代码中，降低了可读性。

**建议修复：**
```typescript
// lib/constants.ts
export const TIME_CONSTANTS = {
  MINUTES_TO_SECONDS: 60,
  HOURS_TO_SECONDS: 3600,
  DEFAULT_FOCUS_MINUTES: 25,
  DEFAULT_SHORT_BREAK_MINUTES: 5,
  DEFAULT_LONG_BREAK_MINUTES: 15
}

// 使用
duration: input.duration * TIME_CONSTANTS.MINUTES_TO_SECONDS,
```

**影响范围：** 代码可读性

---

### 🔧 重构建议

#### 建议 1：统一 API 响应格式

**当前问题：**
不同 API 端点的响应格式略有差异，缺乏统一标准。

**建议：**
```typescript
// lib/api-response.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
  timestamp: string
}

export class ApiResponder {
  static success<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    }, { status })
  }

  static error(error: string, details?: any, status: number = 500): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error,
      details,
      timestamp: new Date().toISOString()
    }, { status })
  }
}

// 使用
export async function GET() {
  try {
    const data = await PomodoroService.getActive()
    return ApiResponder.success(data)
  } catch (error) {
    return ApiResponder.error('获取番茄钟失败', error)
  }
}
```

---

#### 建议 2：添加请求日志

**当前问题：**
缺少请求日志，难以追踪问题和调试。

**建议：**
```typescript
// lib/middleware.ts
export function withLogging(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const startTime = Date.now()
    const url = req.url
    const method = req.method

    Logger.info('API', 'Request received', { method, url })

    try {
      const response = await handler(req)
      const duration = Date.now() - startTime

      Logger.info('API', 'Request completed', {
        method,
        url,
        status: response.status,
        duration: `${duration}ms`
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      Logger.error('API', 'Request failed', {
        method,
        url,
        error: error instanceof Error ? error.message : String(error),
        duration: `${duration}ms`
      })

      throw error
    }
  }
}

// 使用
export const GET = withLogging(async () => {
  // ...
})
```

---

#### 建议 3：添加数据验证中间件

**当前问题：**
每个 API 端点都需要手动解析和验证 JSON，重复代码多。

**建议：**
```typescript
// lib/with-validation.ts
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json()
      const validated = await schema.parseAsync(body)
      return handler(req, validated)
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return ApiResponder.error('参数验证失败', error.errors, 400)
      }
      return ApiResponder.error('请求解析失败', error, 400)
    }
  }
}

// 使用
const createSchema = z.object({
  taskId: z.string().optional(),
  type: z.enum([PomodoroType.FOCUS, PomodoroType.BREAK, PomodoroType.LONG_BREAK]),
  duration: z.number().int().positive()
})

export const POST = withValidation(createSchema, async (req, validated) => {
  const pomodoro = await PomodoroService.start(validated)
  return ApiResponder.success(pomodoro, 201)
})
```

---

## 📋 其他备注

### 代码优点
1. **服务层分离清晰**：PomodoroService 封装了所有番茄钟业务逻辑
2. **使用 Zod 验证**：输入验证严格且类型安全
3. **事务使用正确**：complete 方法使用了事务保证数据一致性
4. **错误处理基本完整**：所有方法都有 try-catch
5. **TypeScript 类型定义完整**：所有接口都有类型定义

### 下一步建议
1. **立即处理**：问题 1-4（认证、Zod 验证、状态持久化、并发）
2. **近期优化**：问题 5-7（N+1 查询、日志、参数验证）
3. **长期改进**：问题 8 和重构建议（Magic Number、API 响应格式、日志、验证中间件）

---

## 🔍 问题追踪

| ID | 问题 | 严重程度 | 状态 | 文件 | 发现日期 |
|----|------|----------|------|------|----------|
| 001 | 缺少用户认证 | 🔴 | 待修复 | app/api/pomodoro/route.ts | 2025-02-20 |
| 002 | Zod 验证错误处理不完整 | 🔴 | 待修复 | app/api/pomodoro/route.ts | 2025-02-20 |
| 003 | 计时器状态在页面刷新后会丢失 | 🔴 | 待修复 | components/timer/* | 2025-02-20 |
| 004 | 并发番茄钟问题未解决 | 🔴 | 待修复 | lib/services/pomodoro.service.ts | 2025-02-20 |
| 005 | 事务中存在 N+1 查询 | 🟡 | 待修复 | lib/services/pomodoro.service.ts | 2025-02-20 |
| 006 | 错误日志格式不统一 | 🟡 | 待修复 | 多个文件 | 2025-02-20 |
| 007 | 缺少请求参数验证 | 🟡 | 待修复 | app/api/pomodoro/route.ts | 2025-02-20 |
| 008 | Magic Number 硬编码 | 🟢 | 待修复 | lib/services/pomodoro.service.ts | 2025-02-20 |

---

**报告生成时间：** 2025-02-20 14:30:00
