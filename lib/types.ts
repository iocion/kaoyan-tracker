// 从 Prisma 重新导出类型，便于使用
import type { Task, Pomodoro, User, UserSettings, DailyStat, StudyRecord, Subject, PomodoroType, PomodoroStatus } from '@prisma/client'

export type { Task, Pomodoro, User, UserSettings, DailyStat, StudyRecord, Subject, PomodoroType, PomodoroStatus }

// 自定义输入类型
export interface TaskCreateInput {
  title: string
  subject: Subject
  estimatedPomodoros?: number
}

export interface TaskUpdateInput {
  title?: string
  subject?: Subject
  estimatedPomodoros?: number
  isActive?: boolean
  isCompleted?: boolean
  completedPomodoros?: number
}

export interface PomodoroCreateInput {
  taskId?: string | null
  type: PomodoroType
  duration: number
}

export interface PomodoroUpdateInput {
  status?: PomodoroStatus
  elapsedTime?: number
}

export interface SettingsUpdateInput {
  focusDuration?: number
  breakDuration?: number
  longBreakDuration?: number
  pomodorosUntilLongBreak?: number
  autoStartBreak?: boolean
  autoStartFocus?: boolean
  soundEnabled?: boolean
  vibrationEnabled?: boolean
}
