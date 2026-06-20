import { useState, useEffect } from 'react'
import { supabase, type Session } from '@/lib/supabase'
import { sessionService } from '@/lib/sessionService'
import { createLogger } from '@/lib/logger'
import { parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { formatStatsTime, getDurationSeconds } from '@/lib/utils' // 👈 Added getDurationSeconds

const log = createLogger('useDashboardStats')

interface Stats {
    totalTime: number
    totalSessions: number
    mostProductiveSlot: string
    leastProductiveSlot: string
    avgSessionTime: number
}

export function useDashboardStats() {
    const [loading, setLoading] = useState(true)
    const [todayStats, setTodayStats] = useState<Stats | null>(null)
    const [weekStats, setWeekStats] = useState<Stats | null>(null)
    const [monthStats, setMonthStats] = useState<Stats | null>(null)
    const [weekSessions, setWeekSessions] = useState<Session[]>([])
    const [monthSessions, setMonthSessions] = useState<Session[]>([])

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        try {
            log.debug('📊 Fetching sessions for dashboard...')
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .not('end_at', 'is', null)
                .order('start_at', { ascending: false })

            if (error) throw error

            const completed = data as Session[]
            log.info(`✅ Fetched ${completed.length} completed sessions`)
            calculateStats(completed)
        } catch (error) {
            log.error('❌ Error fetching sessions:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (sessions: Session[]) => {
        const now = new Date()

        const todayStart = startOfDay(now)
        const todayEnd = endOfDay(now)
        const weekStart = startOfWeek(now, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)

        const todaySessions = sessions.filter(s =>
            isWithinInterval(parseISO(s.start_at), { start: todayStart, end: todayEnd })
        )
        const weekSessions = sessions.filter(s =>
            isWithinInterval(parseISO(s.start_at), { start: weekStart, end: weekEnd })
        )
        const monthSessions = sessions.filter(s =>
            isWithinInterval(parseISO(s.start_at), { start: monthStart, end: monthEnd })
        )

        setWeekSessions(weekSessions)
        setMonthSessions(monthSessions)
        setTodayStats(calculateStatsForSessions(todaySessions))
        setWeekStats(calculateStatsForSessions(weekSessions))
        setMonthStats(calculateStatsForSessions(monthSessions))
    }

    const calculateStatsForSessions = (sessions: Session[]): Stats => {
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
            // 🔥 FIX: Calculate duration from start_at to end_at, not to now
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

    return {
        loading,
        todayStats,
        weekStats,
        monthStats,
        weekSessions,
        monthSessions,
        formatTime: formatStatsTime
    }
}