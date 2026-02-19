import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${h}小时${m}分`
  } else if (m > 0) {
    return `${m}分${s}秒`
  } else {
    return `${s}秒`
  }
}

export function formatTimeHHMMSS(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m > 0) {
    return `${h}小时${m}分`
  }
  return `${h}小时`
}

export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    COMPUTER_408: '#3B82F6',
    MATH: '#10B981',
    ENGLISH: '#F59E0B',
    POLITICS: '#EF4444',
  }
  return colors[subject] || '#6B7280'
}

export function getSubjectName(subject: string): string {
  const names: Record<string, string> = {
    COMPUTER_408: '计算机408',
    MATH: '数学',
    ENGLISH: '英语',
    POLITICS: '政治',
  }
  return names[subject] || subject
}

export function getSubjectShortName(subject: string): string {
  const names: Record<string, string> = {
    COMPUTER_408: '408',
    MATH: '数学',
    ENGLISH: '英语',
    POLITICS: '政治',
  }
  return names[subject] || subject
}
