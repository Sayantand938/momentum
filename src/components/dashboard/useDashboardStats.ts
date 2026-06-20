import { useState, useEffect } from 'react'
import { supabase, type Session } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { formatStatsTime } from '@/lib/utils'
import { calculateStatsForSessions, type Stats } from './statsCalculator'
import { getProductiveSlots } from '@/lib/hourlyUtils' // 👈 Import from shared utils

const log = createLogger('useDashboardStats')

export function useDashboardStats() {
    const [loading, setLoading] = useState(true)
    const [todayStats, setTodayStats] = useState<Stats | null>(null)
    const [weekStats, setWeekStats] = useState<Stats | null>(null)
    const [monthStats, setMonthStats] = useState<Stats | null>(null)
    const [todaySessions, setTodaySessions] = useState<Session[]>([])
    const [weekSessions, setWeekSessions] = useState<Session[]>([])
    const [monthSessions, setMonthSessions] = useState<Session[]>([])
    const [productiveSlots, setProductiveSlots] = useState(0)

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        try {
            log.debug('📊 Fetching current month sessions for dashboard...')
            const monthStart = startOfMonth(new Date())
            const monthEnd = endOfMonth(new Date())

            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .not('end_at', 'is', null)
                .gte('start_at', monthStart.toISOString())
                .lte('start_at', monthEnd.toISOString())
                .order('start_at', { ascending: false })

            if (error) throw error

            const completed = data as Session[]
            log.info(`✅ Fetched ${completed.length} sessions for current month`)
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

        setTodaySessions(todaySessions)
        setWeekSessions(weekSessions)
        setMonthSessions(monthSessions)

        // ✅ Use shared utility - no duplicate calculation!
        setProductiveSlots(getProductiveSlots(todaySessions))

        setTodayStats(calculateStatsForSessions(todaySessions))
        setWeekStats(calculateStatsForSessions(weekSessions))
        setMonthStats(calculateStatsForSessions(monthSessions))
    }

    return {
        loading,
        todayStats,
        weekStats,
        monthStats,
        todaySessions,
        weekSessions,
        monthSessions,
        productiveSlots,
        formatTime: formatStatsTime
    }
}