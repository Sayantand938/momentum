// src/lib/hourlyUtils.ts
import type { Session } from './supabase'
import { parseISO } from 'date-fns'
import { getDurationSeconds } from './utils'
import { TIME } from '@/constants'

export interface HourlyData {
    hour: number
    totalSeconds: number
    actualSeconds: number // How much was actually studied
    bankUsed?: number // How much came from the bank
    isOverflow?: boolean // Whether this hour used bank time
    bankBalance?: number // Bank balance after this hour
}

export interface TimeBankResult {
    hourlyData: HourlyData[]
    remainingBank: number // Bonus time that couldn't be used
    totalBanked: number // Total time that went through the bank
}

/**
 * Calculate time spent per hour (8 AM to 11 PM) with TIME BANK LOGIC
 * Each hour is capped at 30 minutes, excess goes to a time bank
 * Bank time is used to fill hours that don't reach 30 minutes
 */
export function calculateHourlyDistributionWithTimeBank(
    sessions: Session[]
): TimeBankResult {
    // Define hours from 8 AM to 11 PM
    const HOURS = Array.from({ length: 16 }, (_, i) => i + 8)
    const CAP = TIME.HOURLY_GOAL // 30 minutes in seconds

    // Step 1: Calculate actual time per hour
    const actualTime: Record<number, number> = {}
    HOURS.forEach(h => actualTime[h] = 0)

    sessions.forEach(session => {
        const start = parseISO(session.start_at)
        const end = parseISO(session.end_at!)

        HOURS.forEach(hour => {
            const hourStart = new Date(start)
            hourStart.setHours(hour, 0, 0, 0)
            const hourEnd = new Date(start)
            hourEnd.setHours(hour, 59, 59, 999)

            if (start <= hourEnd && end >= hourStart) {
                const overlapStart = start > hourStart ? start : hourStart
                const overlapEnd = end < hourEnd ? end : hourEnd
                const seconds = Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 1000)
                actualTime[hour] = (actualTime[hour] || 0) + seconds
            }
        })
    })

    // Step 2: Build time bank from excess time
    let timeBank = 0
    let totalBanked = 0

    // First pass: Collect excess time into bank
    const hourData: { hour: number; actual: number; needs: number }[] = []

    HOURS.forEach(hour => {
        const actual = actualTime[hour] || 0

        if (actual >= CAP) {
            // This hour has excess - add to bank
            const excess = actual - CAP
            timeBank += excess
            totalBanked += excess
            hourData.push({
                hour,
                actual: CAP, // Cap at 30m
                needs: 0
            })
        } else {
            // This hour needs support from bank
            const needs = CAP - actual
            hourData.push({
                hour,
                actual: actual,
                needs: needs
            })
        }
    })

    // Step 3: Fill slots that need support (in order)
    const finalData: HourlyData[] = []
    let currentBank = timeBank

    hourData.forEach(({ hour, actual, needs }) => {
        let bankUsed: number | undefined
        let total = actual

        if (needs > 0 && currentBank > 0) {
            // This hour needs support and bank has time
            const support = Math.min(needs, currentBank)
            total = actual + support
            currentBank -= support
            bankUsed = support > 0 ? support : undefined
        }

        finalData.push({
            hour,
            totalSeconds: total,
            actualSeconds: actual,
            bankUsed: bankUsed,
            isOverflow: bankUsed !== undefined && bankUsed > 0,
            bankBalance: currentBank // Track bank balance after each hour
        })
    })

    // Step 4: Return result with remaining bank (bonus)
    return {
        hourlyData: finalData,
        remainingBank: currentBank, // This is the bonus time!
        totalBanked: totalBanked
    }
}

/**
 * Get Focus Points - Count how many hours reached 30 minutes using time bank
 * Each point = 1 hour slot that hit the 30-minute goal
 */
export function getFocusPointsWithTimeBank(sessions: Session[]): number {
    if (sessions.length === 0) return 0

    const { hourlyData } = calculateHourlyDistributionWithTimeBank(sessions)
    return hourlyData.filter(h => h.totalSeconds >= TIME.HOURLY_GOAL).length
}

/**
 * Get the remaining bank balance (bonus time)
 */
export function getRemainingBank(sessions: Session[]): number {
    if (sessions.length === 0) return 0

    const { remainingBank } = calculateHourlyDistributionWithTimeBank(sessions)
    return remainingBank
}

/**
 * Legacy: Get Focus Points - each 30m+ single session = 1 point
 */
export function getFocusPoints(sessions: Session[]): number {
    return sessions.filter(session => {
        const duration = getDurationSeconds(session.start_at, session.end_at!)
        return duration >= TIME.FOCUS_POINT_THRESHOLD
    }).length
}

/**
 * Original function - calculates actual time per hour (no overflow)
 * Keep for history/records view
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

        return { hour, totalSeconds, actualSeconds: totalSeconds }
    })
}