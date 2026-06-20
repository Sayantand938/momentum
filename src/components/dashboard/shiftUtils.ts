// src/components/dashboard/shiftUtils.ts
import type { Session } from '@/lib/supabase'
import { parseISO } from 'date-fns'

export interface Shift {
    name: string
    hours: number[]
}

export const SHIFTS: Shift[] = [
    { name: 'Morning', hours: [8, 9, 10, 11] },
    { name: 'Afternoon', hours: [12, 13, 14, 15] },
    { name: 'Evening', hours: [16, 17, 18, 19] },
    { name: 'Night', hours: [20, 21, 22, 23] }
]

export function getShiftForHour(hour: number): string | null {
    for (const shift of SHIFTS) {
        if (shift.hours.includes(hour)) {
            return shift.name
        }
    }
    return null
}

export function getShiftStats(sessions: Session[]): {
    mostProductive: { name: string; totalSeconds: number },
    leastProductive: { name: string; totalSeconds: number }
} {
    // Initialize shift totals
    const shiftTotals: Record<string, number> = {}

    SHIFTS.forEach(shift => {
        shiftTotals[shift.name] = 0
    })

    // Calculate total time per shift
    sessions.forEach(session => {
        const start = parseISO(session.start_at)
        const end = parseISO(session.end_at!)
        const hour = start.getHours()
        const shiftName = getShiftForHour(hour)

        if (shiftName) {
            const duration = Math.floor((end.getTime() - start.getTime()) / 1000)
            shiftTotals[shiftName] = (shiftTotals[shiftName] || 0) + duration
        }
    })

    // Find most and least productive
    let mostProductive = { name: 'No data', totalSeconds: 0 }
    let leastProductive = { name: 'No data', totalSeconds: Infinity }

    SHIFTS.forEach(shift => {
        const total = shiftTotals[shift.name] || 0
        if (total > mostProductive.totalSeconds) {
            mostProductive = { name: shift.name, totalSeconds: total }
        }
        if (total < leastProductive.totalSeconds && total > 0) {
            leastProductive = { name: shift.name, totalSeconds: total }
        }
    })

    // If leastProductive still has Infinity (no sessions), set to No data
    if (leastProductive.totalSeconds === Infinity) {
        leastProductive = { name: 'No data', totalSeconds: 0 }
    }

    return { mostProductive, leastProductive }
}