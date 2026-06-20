// src/components/dashboard/statsCalculator.ts
import type { Session } from '@/lib/supabase'
import { getDurationSeconds } from '@/lib/utils'
import { parseISO } from 'date-fns'

export interface Stats {
    totalTime: number
    totalSessions: number
    mostProductiveSlot: string
    leastProductiveSlot: string
    avgSessionTime: number
}

export function calculateStatsForSessions(sessions: Session[]): Stats {
    if (sessions.length === 0) {
        return {
            totalTime: 0,
            totalSessions: 0,
            mostProductiveSlot: 'No data',
            leastProductiveSlot: 'No data',
            avgSessionTime: 0
        }
    }

    let totalTime = 0
    const durations: number[] = []

    sessions.forEach(session => {
        const duration = getDurationSeconds(session.start_at, session.end_at!)
        totalTime += duration
        durations.push(duration)
    })

    const avgSessionTime = Math.round(totalTime / sessions.length)

    const hourMap: Record<number, number> = {}
    sessions.forEach(session => {
        const hour = parseISO(session.start_at).getHours()
        hourMap[hour] = (hourMap[hour] || 0) + 1
    })

    let mostHour = -1
    let leastHour = -1
    let maxCount = -1
    let minCount = Infinity

    Object.entries(hourMap).forEach(([hour, count]) => {
        const h = parseInt(hour)
        if (count > maxCount) {
            maxCount = count
            mostHour = h
        }
        if (count < minCount) {
            minCount = count
            leastHour = h
        }
    })

    const formatHour = (hour: number) => {
        if (hour === -1) return 'No data'
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const h12 = hour % 12 || 12
        return `${h12}:00 ${ampm}`
    }

    return {
        totalTime,
        totalSessions: sessions.length,
        mostProductiveSlot: mostHour !== -1 ? formatHour(mostHour) : 'No data',
        leastProductiveSlot: leastHour !== -1 ? formatHour(leastHour) : 'No data',
        avgSessionTime
    }
}