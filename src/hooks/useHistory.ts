import { useState, useEffect } from 'react'
import { supabase, type Session } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import {
    format,
    parseISO,
    isSameDay,
    startOfMonth,
    endOfMonth
} from 'date-fns'
import {
    formatShortDate,
    formatTimeString,
    getDurationSeconds,
    formatDuration,
    formatStatsTime
} from '@/lib/utils'
import { DATE_FORMATS } from '@/constants'
import { calculateHourlyDistributionWithTimeBank } from '@/lib/timeBank'  // Changed from hourlyUtils

const log = createLogger('useHistory')

type ViewMode = 'actual' | 'normalized'

export function useHistory() {
    const [allSessions, setAllSessions] = useState<Session[]>([])
    const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('normalized')

    useEffect(() => {
        fetchSessions()
    }, [])

    useEffect(() => {
        fetchSessions()
    }, [selectedDate])

    useEffect(() => {
        filterSessions()
    }, [allSessions, selectedDate])

    const fetchSessions = async () => {
        try {
            log.debug(`📜 Fetching sessions for ${format(selectedDate, DATE_FORMATS.MONTH_YEAR)}...`)
            setLoading(true)

            const monthStart = startOfMonth(selectedDate)
            const monthEnd = endOfMonth(selectedDate)

            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .not('end_at', 'is', null)
                .gte('start_at', monthStart.toISOString())
                .lte('start_at', monthEnd.toISOString())
                .order('start_at', { ascending: false })

            if (error) throw error

            const completed = data as Session[]
            log.info(`✅ Fetched ${completed.length} sessions for ${format(selectedDate, DATE_FORMATS.MONTH_YEAR)}`)
            setAllSessions(completed)
        } catch (error) {
            log.error('❌ Error fetching sessions:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterSessions = () => {
        const filtered = allSessions.filter(session => {
            const sessionDate = parseISO(session.start_at)
            return isSameDay(sessionDate, selectedDate)
        })
        setFilteredSessions(filtered)
    }

    const getNormalizedData = () => {
        if (filteredSessions.length === 0) return []

        try {
            const result = calculateHourlyDistributionWithTimeBank(filteredSessions)
            const HOURS = Array.from({ length: 16 }, (_, i) => i + 8)

            return result.hourlyData.map((slot: { hour: number; totalSeconds: number; actualSeconds: number; bankUsed?: number; isOverflow?: boolean }, index: number) => {
                const hour = HOURS[index]
                return {
                    hour,
                    label: formatHourLabel(hour),
                    totalSeconds: slot.totalSeconds,
                    actualSeconds: slot.actualSeconds,
                    bankUsed: slot.bankUsed,
                    isComplete: slot.totalSeconds >= 1800,
                    isOverflow: slot.isOverflow || false,
                }
            })
        } catch (error) {
            log.error('❌ Error calculating normalized data:', error)
            return []
        }
    }

    const formatHourLabel = (hour: number): string => {
        if (hour === 0) return '12:00 AM'
        if (hour < 12) return `${hour.toString().padStart(2, '0')}:00 AM`
        if (hour === 12) return '12:00 PM'
        return `${(hour - 12).toString().padStart(2, '0')}:00 PM`
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date)
            setIsCalendarOpen(false)
        }
    }

    return {
        loading,
        filteredSessions,
        selectedDate,
        isCalendarOpen,
        viewMode,
        setViewMode,
        setIsCalendarOpen,
        handleDateSelect,
        formatDate: formatShortDate,
        formatTime: formatTimeString,
        formatStatsTime: formatStatsTime,
        formatHourLabel,
        formatDuration: (startAt: string, endAt: string) => {
            const seconds = getDurationSeconds(startAt, endAt)
            return formatDuration(seconds)
        },
        getNormalizedData,
    }
}