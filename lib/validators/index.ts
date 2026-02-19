import { z } from 'zod'
import { Subject, PomodoroType, PomodoroStatus } from '@/types'

// ============ 番茄钟验证器 ============

export const pomodoroCreateSchema = z.object({
  taskId: z.string().optional().nullable(),
  type: z.nativeEnum(PomodoroType, {
    message: '无效的番茄钟类型'
  }),
  duration: z.number()
    .min(1, '时长至少 1 分钟')
    .max(120, '时长不能超过 120 分钟')
})

export const pomodoroUpdateSchema = z.object({
  id: z.string().min(1, '番茄钟 ID 不能为空'),
  status: z.nativeEnum(PomodoroStatus, {
    message: '无效的状态'
  }),
  elapsedTime: z.number()
    .min(0, '已用时间不能为负数')
})

export const pomodoroPauseSchema = z.object({
  id: z.string().min(1, '番茄钟 ID 不能为空')
})

export const pomodoroResumeSchema = z.object({
  id: z.string().min(1, '番茄钟 ID 不能为空')
})

export const pomodoroCompleteSchema = z.object({
  id: z.string().min(1, '番茄钟 ID 不能为空')
})

export const pomodoroCancelSchema = z.object({
  id: z.string().min(1, '番茄钟 ID 不能为空')
})

// ============ 任务验证器 ============

export const taskCreateSchema = z.object({
  title: z.string()
    .min(1, '任务标题不能为空')
    .max(200, '任务标题不能超过 200 字符'),
  subject: z.nativeEnum(Subject, {
    message: '无效的学科类型'
  }),
  estimatedPomodoros: z.number()
    .min(1, '预计番茄数至少为 1')
    .max(20, '预计番茄数不能超过 20')
    .optional()
    .default(1)
})

export const taskUpdateSchema = z.object({
  id: z.string().min(1, '任务 ID 不能为空'),
  title: z.string()
    .min(1, '任务标题不能为空')
    .max(200, '任务标题不能超过 200 字符')
    .optional(),
  subject: z.nativeEnum(Subject, {
    message: '无效的学科类型'
  }).optional(),
  estimatedPomodoros: z.number()
    .min(1, '预计番茄数至少为 1')
    .max(20, '预计番茄数不能超过 20')
    .optional(),
  isActive: z.boolean().optional(),
  isCompleted: z.boolean().optional()
})

export const taskDeleteSchema = z.object({
  id: z.string().min(1, '任务 ID 不能为空')
})

export const taskSetActiveSchema = z.object({
  id: z.string().min(1, '任务 ID 不能为空')
})

// ============ 设置验证器 ============

export const settingsUpdateSchema = z.object({
  focusDuration: z.number()
    .min(5, '专注时长至少 5 分钟')
    .max(90, '专注时长不能超过 90 分钟')
    .optional(),
  breakDuration: z.number()
    .min(1, '休息时长至少 1 分钟')
    .max(30, '休息时长不能超过 30 分钟')
    .optional(),
  longBreakDuration: z.number()
    .min(5, '长休息时长至少 5 分钟')
    .max(60, '长休息时长不能超过 60 分钟')
    .optional(),
  pomodorosUntilLongBreak: z.number()
    .min(2, '至少 2 个番茄后长休息')
    .max(8, '最多 8 个番茄后长休息')
    .optional(),
  autoStartBreak: z.boolean().optional(),
  autoStartFocus: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  vibrationEnabled: z.boolean().optional()
})

// ============ 统计验证器 ============

export const statsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month']).optional().default('week'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

// ============ 记录验证器 ============

export const recordCreateSchema = z.object({
  subject: z.nativeEnum(Subject, {
    message: '无效的学科类型'
  }),
  duration: z.number()
    .min(0.1, '学习时长至少 0.1 小时')
    .max(24, '学习时长不能超过 24 小时'),
  notes: z.string()
    .max(500, '备注不能超过 500 字符')
    .optional()
    .nullable()
})

export const recordQuerySchema = z.object({
  limit: z.number()
    .min(1, '限制数量至少为 1')
    .max(100, '限制数量不能超过 100')
    .optional()
    .default(50),
  subject: z.nativeEnum(Subject).optional()
})

// ============ 导出类型 ============

export type PomodoroCreateInput = z.infer<typeof pomodoroCreateSchema>
export type PomodoroUpdateInput = z.infer<typeof pomodoroUpdateSchema>
export type TaskCreateInput = z.infer<typeof taskCreateSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>
export type RecordCreateInput = z.infer<typeof recordCreateSchema>
export type StatsQueryInput = z.infer<typeof statsQuerySchema>
