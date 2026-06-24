import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, formatRelative, parseISO } from 'date-fns'
import { DATE_FORMATS } from '@/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============ TIME FORMATTING UTILITIES ============

/**
 * Format seconds into a human-readable time string (e.g., "2h 30m 12s", "45m", "30s")
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return '0s'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0 && minutes > 0 && remainingSeconds > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  }
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`
  }
  if (hours > 0 && remainingSeconds > 0) {
    return `${hours}h ${remainingSeconds}s`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  if (minutes > 0) {
    return `${minutes}m`
  }
  return `${remainingSeconds}s`
}

/**
 * Format seconds into a compact time string for progress bars (e.g., "2h 30m", "45m")
 */
export function formatCompactTime(seconds: number): string {
  if (seconds === 0) return '0h 0m'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

/**
 * Format seconds into a display time string for stats (e.g., "2h 30m", "45m 30s")
 */
export function formatStatsTime(seconds: number): string {
  if (seconds === 0) return '0s'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${remainingSeconds}s`
}

/**
 * Format seconds into timer display (MM:SS or HH:MM:SS)
 */
export function formatTimerDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

// ============ DATE FORMATTING UTILITIES (using date-fns) ============

/**
 * Format a date string to a short date (e.g., "MMM d, yyyy")
 */
export function formatShortDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy')
}

/**
 * Format a date string to a compact date (e.g., "MMM d")
 */
export function formatCompactDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d')
}

/**
 * Format a date string to a time string (e.g., "h:mm a")
 */
export function formatTimeString(dateString: string): string {
  return format(parseISO(dateString), 'h:mm a')
}

/**
 * Format a date string to a full date (e.g., "EEEE, MMMM d, yyyy")
 */
export function formatFullDate(dateString: string): string {
  return format(parseISO(dateString), 'EEEE, MMMM d, yyyy')
}

/**
 * Format a date string to a date with weekday (e.g., "EEE, MMM d")
 */
export function formatDateWithWeekday(dateString: string): string {
  return format(parseISO(dateString), 'EEE, MMM d')
}

/**
 * Get the day name from a date string (e.g., "Mon", "Tue")
 */
export function getDayName(dateString: string): string {
  return format(parseISO(dateString), 'EEE')
}

/**
 * Get the full day name from a date string (e.g., "Monday", "Tuesday")
 */
export function getFullDayName(dateString: string): string {
  return format(parseISO(dateString), 'EEEE')
}

/**
 * Format a date string to ISO date (e.g., "yyyy-MM-dd")
 */
export function formatISODate(dateString: string): string {
  return format(parseISO(dateString), 'yyyy-MM-dd')
}

/**
 * Format a date to a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
}

/**
 * Format a date with a custom format string
 */
export function formatDate(dateString: string, formatStr: string): string {
  return format(parseISO(dateString), formatStr)
}

/**
 * Get the week number from a date
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

// ============ DURATION CALCULATION UTILITIES ============

/**
 * Calculate duration between two timestamps in seconds
 */
export function getDurationSeconds(startAt: string, endAt: string): number {
  const start = new Date(startAt).getTime()
  const end = new Date(endAt).getTime()
  return Math.floor((end - start) / 1000)
}

/**
 * Get elapsed seconds from a start timestamp
 */
export function getElapsedSeconds(startAt: string): number {
  const start = new Date(startAt).getTime()
  const now = Date.now()
  return Math.floor((now - start) / 1000)
}

/**
 * Format a date using date-fns with the provided format string
 */
export function formatDateString(date: Date | string, formatStr: string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr)
}