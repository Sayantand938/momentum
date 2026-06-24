// src/lib/hourlyUtils.ts
import type { Session } from './supabase'
import { parseISO } from 'date-fns'
import { getDurationSeconds } from './utils'
import { TIME } from '@/constants'

export interface HourlyData {
    hour: number
    totalSeconds: number
}

/**
 * Calculate time spent per hour (8 AM to 11 PM)
 * Splits sessions across hours (e.g., 8:45-9:15 gives 15m each)
 */
export function calculateHourlyDistribution(sessions: Session[]): HourlyData[] {
    const hours = Array.from({ length: 16 }, (_, i) => i + 8)

    return hours.map(hour => {
        let totalSeconds = 0

        sessions.forEach(session => {
            const start = parseISO(session.start_at)
            const end = parseISO(session.end_at!)

            const hourStart = new Date(start)
            hourStart.setHours(hour, 0, 0, 0)

            const hourEnd = new Date(start)
            hourEnd.setHours(hour, 59, 59, 999)

            if (start <= hourEnd && end >= hourStart) {
                const overlapStart = start > hourStart ? start : hourStart
                const overlapEnd = end < hourEnd ? end : hourEnd
                const seconds = Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 1000)
                totalSeconds += seconds
            }
        })

        return { hour, totalSeconds }
    })
}

/**
 * Get Focus Points - each 30m+ single session = 1 point
 */
export function getFocusPoints(sessions: Session[]): number {
    return sessions.filter(session => {
        const duration = getDurationSeconds(session.start_at, session.end_at!)
        return duration >= TIME.FOCUS_POINT_THRESHOLD
    }).length
}