// ============ 通用类型 ============

export type Response<T = any> = {
  success: boolean
  data?: T
  error?: string
  code?: number
}

export type PaginationParams = {
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export type DateRange = {
  start: Date
  end: Date
}

// ============ 学科类型 ============

export enum Subject {
  COMPUTER_408 = 'COMPUTER_408',
  MATH = 'MATH',
  ENGLISH = 'ENGLISH',
  POLITICS = 'POLITICS'
}

export const SUBJECT_CONFIG: Record<Subject, {
  name: string
  shortName: string
  color: string
  icon: string
}> = {
  [Subject.COMPUTER_408]: {
    name: '计算机408',
    shortName: '408',
    color: '#3B82F6',
    icon: '💻'
  },
  [Subject.MATH]: {
    name: '数学',
    shortName: '数学',
    color: '#10B981',
    icon: '📐'
  },
  [Subject.ENGLISH]: {
    name: '英语',
    shortName: '英语',
    color: '#F59E0B',
    icon: '📖'
  },
  [Subject.POLITICS]: {
    name: '政治',
    shortName: '政治',
    color: '#EF4444',
    icon: '🏛️'
  }
}

// ============ 番茄钟类型 ============

export enum PomodoroType {
  FOCUS = 'FOCUS',
  BREAK = 'BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export enum PomodoroStatus {
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Pomodoro {
  id: string
  userId: string
  taskId?: string | null
  task?: Task
  type: PomodoroType
  status: PomodoroStatus
  duration: number // 计划时长（秒）
  elapsedTime: number // 已用时间（秒）
  startedAt: Date
  endedAt?: Date | null
  pauseCount: number
  totalPausedTime: number // 总共暂停的时间（秒）
}

export interface PomodoroCreateInput {
  taskId?: string | null
  type: PomodoroType
  duration: number // 分钟
}

export interface PomodoroUpdateInput {
  status: PomodoroStatus
  elapsedTime: number
}

export interface PomodoroStats {
  total: number
  completed: number
  cancelled: number
  totalFocusTime: number // 秒
  totalBreakTime: number // 秒
  avgDuration: number // 秒
  byType: Record<PomodoroType, number>
  byDay: Array<{
    date: string
    count: number
    focusTime: number
  }>
}

// ============ 任务类型 ============

export interface Task {
  id: string
  userId: string
  title: string
  subject: Subject
  estimatedPomodoros: number
  completedPomodoros: number
  isCompleted: boolean
  isActive: boolean
  createdAt: Date
  completedAt?: Date | null
  pomodoros?: Pomodoro[]
}

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
}

export interface TaskStats {
  total: number
  completed: number
  inProgress: number
  bySubject: Record<Subject, number>
}

// ============ 设置类型 ============

export interface UserSettings {
  id: string
  userId: string
  focusDuration: number // 专注时长（分钟）
  breakDuration: number // 休息时长（分钟）
  longBreakDuration: number // 长休息时长（分钟）
  pomodorosUntilLongBreak: number // 几个番茄后长休息
  autoStartBreak: boolean // 自动开始休息
  autoStartFocus: boolean // 自动开始专注
  soundEnabled: boolean // 声音提醒
  vibrationEnabled: boolean // 震动提醒
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

// ============ 统计类型 ============

export interface DailyStat {
  id: string
  userId: string
  date: Date
  totalPomodoros: number
  totalFocusTime: number // 专注时间（秒）
  totalBreakTime: number // 休息时间（秒）
  pomodoros408: number
  pomodorosMath: number
  pomodorosEnglish: number
  pomodorosPolitics: number
  completedTasks: number
  createdTasks: number
  createdAt: Date
}

export interface StatSummary {
  period: 'today' | 'week' | 'month'
  totalPomodoros: number
  totalHours: number
  bySubject: Record<Subject, {
    pomodoros: number
    hours: number
  }>
  tasks: {
    completed: number
    created: number
  }
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface PieChartData {
  name: string
  value: number
  color: string
}

// ============ 用户类型 ============

export interface User {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

// ============ API 请求/响应类型 ============

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

// ============ 记录类型 ============

export interface StudyRecord {
  id: string
  userId: string
  subject: Subject
  duration: number // 小时
  notes?: string | null
  createdAt: Date
}

export interface StudyRecordCreateInput {
  subject: Subject
  duration: number
  notes?: string | null
}
