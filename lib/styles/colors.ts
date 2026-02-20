/**
 * Apple 风格颜色系统 - 参考 Foucs
 * 主色调：淡淡的浅蓝色 (#60a5fa)
 */

export const colors = {
  // 主色调 - 淡浅蓝
  primary: '#60a5fa',
  primaryLight: '#60a5fa',
  primaryDark: '#3b82f6',
  primaryFade: 'rgba(96, 165, 250, 0.1)',

  // 背景色
  background: '#fafafa',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#f5f5f7',

  // 文字颜色
  text: '#1d1d1f',
  textSecondary: '#4b5563',
  textTertiary: '#6b7280',

  // 边框颜色
  border: '#e5e7eb',
  borderLight: '#f0f0f0',

  // 毛玻璃效果
  glass: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',

  // 阴影
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',

  // 状态颜色
  success: '#34c759',
  warning: '#f59e0b',
  error: '#ef4444',
  danger: '#ef4444',
  info: '#3b82f6',

  // 学科颜色
  subject408: '#60a5fa',
  subjectMath: '#8b5cf6',
  subjectEnglish: '#f59e0b',
  subjectPolitics: '#ef4444'
}

export const darkColors = {
  // 主色调 - 深浅蓝
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',

  // 背景色
  background: '#0a0a0a',
  backgroundSecondary: '#111111',
  backgroundTertiary: '#1a1a1a',

  // 文字颜色
  text: '#e5e5e5',
  textSecondary: '#a3a3a3',
  textTertiary: '#8b8b8b',

  // 边框颜色
  border: '#2d2d2d',
  borderLight: '#1f1f1f',

  // 毛玻璃效果
  glass: 'rgba(0, 0, 0, 0.5)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // 阴影
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowLight: 'rgba(0, 0, 0, 0.15)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',

  // 状态颜色
  success: '#34c759',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#60a5fa',

  // 学科颜色
  subject408: '#3b82f6',
  subjectMath: '#8b5cf6',
  subjectEnglish: '#f59e0b',
  subjectPolitics: '#ef4444'
}

export const getSubjectColor = (subject: string) => {
  switch (subject) {
    case 'COMPUTER_408':
      return colors.subject408
    case 'MATH':
      return colors.subjectMath
    case 'ENGLISH':
      return colors.subjectEnglish
    case 'POLITICS':
      return colors.subjectPolitics
    default:
      return colors.primary
  }
}
